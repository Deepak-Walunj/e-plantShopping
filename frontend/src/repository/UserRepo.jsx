import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_API_URL
const URL = `${BASE_URL}/user`
const ENDPOINTS = {
    SIGNUP: `${URL}/signup`,
    GOOGLEOAUTH: `https://www.googleapis.com/oauth2/v3/userinfo`,
}

export const googleOauthApi = async (token) => {
    return await MakeApiCall({
        url: ENDPOINTS.GOOGLEOAUTH,
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const userSignupApi = async (userData) => {
    let response = {}
    try {
        response = await MakeApiCall({
            url: ENDPOINTS.SIGNUP,
            method: "POST",
            data: userData,
        })
    } catch (error) {
        console.error(error)
        throw new Error(error?.response?.data?.message)
    }

    if (response.status !== 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage || "Signup failed");
    }
    return response.data
}