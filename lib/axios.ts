import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

export const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('refresh_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

export const setAuthToken = (token: string) => {
    document.cookie = `access_token=${token}; path=/; max-age=3600; SameSite=Lax`;
};

export const setRefreshToken = (token: string) => {
    document.cookie = `refresh_token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

export const clearAuthTokens = () => {
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
};

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Match 401 response representing expired tokens
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();
            
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken
                    });
                    
                    if (response.data.access) {
                        setAuthToken(response.data.access);
                        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                        // Re-trigger the pending request with the new access token
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    clearAuthTokens();
                    if (typeof window !== 'undefined') window.location.href = '/login';
                }
            } else {
                clearAuthTokens();
            }
        }
        
        return Promise.reject(error);
    }
);
