import axios from 'axios';
import { LOCAL_STORAGE_ACCESS_TOKEN_KEY, LOCAL_STORAGE_ACCESS_USER_INFO } from '@utils/Constants'
import { logOut } from '@utils/AuthUtils';
const BASE_URL = import.meta.env.VITE_API_URL
const URL = `${BASE_URL}/auth`

let isRefreshing = false;
let failedQueue = []

const axiosInstance = axios.create({
    withCredentials: true
})

axiosInstance.interceptors.request.use( //while requesting to server
    (config) => {
        const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.debug("[ApiUtils] Auth token added to request");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

axiosInstance.interceptors.response.use( //while responding back from server
    (response) => response, //successHandler
    async (error) => {       //errorhandler
        const originalRequest = error.config;
        if (originalRequest?.url?.includes("/auth/refresh")) {
            return Promise.reject(error);
        }
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("[ApiUtils] 401 Unauthorized response received. Attempting to refresh access token...")
            if (isRefreshing) { //if already refreshing for a api and another comes then executes this block
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return axiosInstance(originalRequest)
                })
            }
            originalRequest._retry = true
            isRefreshing = true

            try {
                const newToken = await refreshAccessToken()
                if (!newToken) {
                    // no valid token returned - clear everything and update context
                    logOut(); // handler will clear context if registered
                    window.location.href = "/";
                    return Promise.reject(error);
                }
                processQueue(null, newToken)
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // refresh failed entirely
                logOut();
                window.location.href = "/";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
)

async function refreshAccessToken() {
    try {
        // use the same axios instance so the request carries any default
        // headers and withCredentials setting.
        const response = await axiosInstance.post(`${URL}/refresh`, {});
        const newToken = response?.data?.data?.access_token;
        if (newToken) {
            localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, newToken);
            return newToken;
        }
        return null;
    } catch (err) {
        console.error("Failed to refresh access token:", err);
        return null;
    }
}

/**
 * Make an API call with retry and error handling
 * @param {Object} options - Axios request config
 * @param {boolean} retry - Whether to retry on failure
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries (ms)
 * @param {number[]} errorCodesToNotRetry - HTTP status codes that should not be retried
 * @param {boolean} redirect_on_unauthorized - Whether to redirect to login on 401/403
 */

async function MakeApiCall(options = {}, retry = false, retries = 3, delay = 500, errorCodesToNotRetry = [400, 401]) {
    const { redirect_on_unauthorized = true } = options;
    // if (options.redirect_on_unauthorized !== undefined) {
    //     const { redirect_on_unauthorized, ...restOptions } = options;
    //     options = restOptions;
    // }
    let attempt = 0;
    let data = {};
    let status = 200;

    while (attempt < retries) {
        try {
            const finalOptions = {
                ...options,
                withCredentials: options.url?.includes("googleapis.com") ? false : true
            };
            const response = await axiosInstance(finalOptions);
            data = response.data;
            break
        } catch (error) {
            const statusCode = error.response ? error.response.status : null;
            const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ACCESS_USER_INFO) || "{}")
            const isDemo = userInfo?.userType === "demo"
            if (isDemo) {
                console.warn("Demo user → ignoring API failure:", statusCode)
                return {
                    data:
                        { success: true, data: { username: "Demo User", email: "demo@recipegencook.ai", role: "Demo", }, isDemo: true },
                    status: 200
                };
            }
            if (statusCode === 500) {
                throw new Error(`Server error (status ${error.response.status}): ${error.response.statusText}`);
            } else if (statusCode && errorCodesToNotRetry.includes(statusCode)) {
                status = statusCode;
                data = error.response.data;
                break;
            } else {
                attempt++;
                console.warn(`[ApiUtils] Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                if (!retry || attempt === retries) {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, delay)); // Delay before retrying
            }
        }
    }
    return { data, status };
}

// Input sanitization utility
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};

export default MakeApiCall;
