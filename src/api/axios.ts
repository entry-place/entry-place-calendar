import axios, { AxiosError } from 'axios';
import { entryPlaceApiHeaders } from './credentials';

// Shared API client for the calendar UI. Errors log to the console.

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_HOST,
    headers: {
        ...entryPlaceApiHeaders(),
        'X-Requested-With': 'XMLHttpRequest',
        'Frontend-Request': 'true',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
    },
    withCredentials: true,
    // This caused me a lot of grief not knowing this existed.
    // Without this the API would return 419 errors
    withXSRFToken: true
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error('API request failed:', {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: error.response?.status,
            statusText: error.response?.statusText,
        });

        return Promise.reject(error);
    }
);

export default axiosInstance;
