import { LOCAL_STORAGE_ACCESS_TOKEN_KEY, LOCAL_STORAGE_ACCESS_USER_INFO, LOCAL_STORAGE_ACCESS_ENTITY_KEY } from "@utils/Constants";

let logoutHandler = null;

export const registerLogoutHandler = (fn) => {
    logoutHandler = fn;
};

export const triggerLogoutHandler = () => {
    if (typeof logoutHandler === "function") {
        logoutHandler();
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    return !!token
}

export const isEntityAuthorized = (allowedEntity) => {
    const signedInEntity = localStorage.getItem(LOCAL_STORAGE_ACCESS_ENTITY_KEY);
    console.log({ signedInEntity, allowedEntity, empty: !!signedInEntity, second: allowedEntity == signedInEntity })
    return !!signedInEntity && allowedEntity === signedInEntity;
}

export const logOut = (setUser, clearAll = false, additional_keys = []) => {
    // prefer context logout if available
    if (typeof setUser === "function") {
        setUser(null);
    } else if (logoutHandler) {
        // caller didn't provide setUser (maybe they passed true/false)
        // but we still want to clear the React context
        logoutHandler();
    }

    // clear storage keys regardless
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_USER_INFO);
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_ENTITY_KEY);
    if (additional_keys && additional_keys.length) {
        additional_keys.forEach(key => localStorage.removeItem(key));
    }
    if (clearAll) {
        localStorage.clear();
    }
}

export const clearStorage = () => {
    localStorage.clear();
}

export const handleLoginSuccess = (entity, access_token, setUser, userType) => {
    try {
        const userInfo = { access_token, entity, userType };
        setUser(userInfo);   // Only update context
    } catch (error) {
        console.error("Failed to handle login success", error);
    }
}