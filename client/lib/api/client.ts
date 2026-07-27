import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL comes from the environment (VITE_API_BASE_URL). Falls back to
// the production URL so the app still works if the var is unset.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://envest.live/qSdb89lP/';
const TOKEN_KEY = 'envest_auth_token';
const USER_KEY = 'envest_user_session';

const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to check internet connectivity
const checkOnlineStatus = () => {
    if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network settings.');
    }
};

// Request Interceptor
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        checkOnlineStatus();

        // Token Injection
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Handle array response based on Postman collection observation
        const responseData = Array.isArray(response.data) ? response.data[0] : response.data;

        // Token Extraction
        // Based on the provided example response: { code: 200, status: true, message: "Login successful", data: { token: "...", ... } }
        if (responseData?.data?.token) {
            localStorage.setItem(TOKEN_KEY, responseData.data.token);
        }

        // Return the processed data or the original response data
        return responseData;
    },
    (error: AxiosError) => {
        // Global 401 handler: session expired or invalid token.
        // Clear every trace of the session and force the user back to login.
        if (error.response && error.response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            sessionStorage.removeItem(USER_KEY);

            // Hard redirect (resets all in-memory app/store state). Guard against
            // a redirect loop if a request on the login page itself 401s.
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.replace('/login');
            }
        }

        return Promise.reject(error);
    }
);

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const apiClient = async <T = any>(
    method: HttpMethod,
    endpoint: string,
    payload?: any
): Promise<T> => {
    try {
        const response = await instance.request<T>({
            method,
            url: endpoint,
            data: payload,
        });
        return response as T;
    } catch (error) {
        // Re-throw the error so React Query can catch it
        throw error;
    }
};

export default apiClient;
