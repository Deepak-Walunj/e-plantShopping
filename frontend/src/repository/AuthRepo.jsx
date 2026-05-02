import { ENTITY } from '@utils/Constants';
import MakeApiCall from "@utils/ApiUtils";
const BASE_URL = import.meta.env.VITE_API_URL
const URL = `${BASE_URL}/auth`
const ENDPOINTS = {
    LOGIN: `${URL}/login`,
    VERIFY_EMAIL: `${URL}/verify-email`,
    RESEND_EMAIL: `${URL}/resend-verification`
}

export const loginApi = async (email, password, entity_type, auth_provider) => {
    let response = {}
    try {
        response = await MakeApiCall({
            url: ENDPOINTS.LOGIN,
            method: "POST",
            data: { email, password, entity_type, auth_provider },
            redirect_on_unauthorized: false,
        })
    } catch (error) {
        console.error(error);
        throw new Error(error?.response?.data?.message)
    }
    if (response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage);
    }
    return response.data
}

export const adminLoginApi = async (email, password, auth_provider) => {
    return loginApi(email, password, ENTITY.ADMIN, auth_provider)
}

export const userLoginApi = async (email, password, auth_provider) => {
    return loginApi(email, password, ENTITY.USER, auth_provider)
}

export const verifyEmailApi = async (token, entity_type) => {
    let response = {}
    try {
        response = await MakeApiCall({
            url: ENDPOINTS.VERIFY_EMAIL,
            method: "GET",
            params: { token, entity_type },
        })
    } catch (error) {
        console.error(error);
        throw new Error(error?.response?.data?.message)
    }
    if (response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage);
    }
    return response.data
}

export const resendVerificationApi = async (email, entity_type) => {
    let response = {}
    try {
        response = await MakeApiCall({
            url: ENDPOINTS.RESEND_EMAIL,
            method: "GET",
            params: { email, entity_type },
        })
    } catch (error) {
        console.error(error);
        throw new Error(error?.response?.data?.message)
    }
    if (response.status != 200) {
        const backendMessage = response?.data?.message;
        const detailsMessage = response?.data?.details?.[0]?.message;
        throw new Error(backendMessage || detailsMessage);
    }
    return response.data
}