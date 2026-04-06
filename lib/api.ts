// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to get auth token from cookies
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Helper function to set auth token in cookies
export const setAuthToken = (token: string) => {
    document.cookie = `access_token=${token}; path=/; max-age=3600; SameSite=Lax`;
};

// Helper function to set refresh token in cookies
export const setRefreshToken = (token: string) => {
    document.cookie = `refresh_token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

// Helper function to clear auth tokens
export const clearAuthTokens = () => {
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
};

import { apiClient } from './axios';

// Generic fetch wrapper with auth
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const method = options.method || 'GET';
    try {
        let data = undefined;
        if (options.body) {
            // Handle native RequestInit body parsing to axios data
            data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        }

        const response = await apiClient({
            url: endpoint,
            method,
            data,
            headers: options.headers as Record<string, string>,
        });
        
        return response.data;
    } catch (error: any) {
        const status = error.response?.status;
        const data = error.response?.data;
        const message = error.message || 'Unknown API error';
        const isAuthMeRequest = endpoint === '/auth/me/' || endpoint === 'auth/me/';

        if (!error.response) {
            console.error('[API Error]', method, endpoint, status, data, message);
            throw new Error(
                `Network Error: unable to reach API server at ${API_BASE_URL}. ` +
                'Please ensure the backend is running and accessible.'
            );
        }

        if (!isAuthMeRequest) {
            console.error('[API Error]', method, endpoint, status, data, message);
        }

        if (error.response?.data) {
            const errorData = error.response.data;
            let errorMessage = errorData.detail || errorData.message;

            if (!errorMessage && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, value]) => {
                        const msg = Array.isArray(value) ? value.join(', ') : String(value);
                        return `${key}: ${msg}`;
                    })
                    .join(' | ');
                if (messages) errorMessage = messages;
            }

            const customError = new Error(errorMessage || 'Request failed');
            (customError as any).response = { data: errorData, status: error.response.status };
            throw customError;
        }
        throw error;
    }
}

// Auth API
export const authAPI = {
    async register(data: {
        username: string;
        email: string;
        password: string;
        password2: string;
        first_name?: string;
        last_name?: string;
        city: string;
        phone?: string;
    }) {
        const response = await apiFetch<{
            user: any;
            tokens: { access: string; refresh: string };
        }>('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        setAuthToken(response.tokens.access);
        setRefreshToken(response.tokens.refresh);

        return response;
    },

    async login(username: string, password: string) {
        const response = await apiFetch<{ access: string; refresh: string }>(
            '/auth/login/',
            {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            }
        );

        setAuthToken(response.access);
        setRefreshToken(response.refresh);

        return response;
    },

    async getCurrentUser() {
        return apiFetch<any>('/auth/me/');
    },

    logout() {
        clearAuthTokens();
    },
};

// Products API
export const productsAPI = {
    async list(params?: {
        category?: string;
        min_price?: number;
        max_price?: number;
        condition?: string;
        is_auction?: boolean;
        auctions_only?: boolean;
        search?: string;
        page?: number;
    }) {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
        }

        const query = queryParams.toString();
        return apiFetch<{ results: any[]; count: number; next: string | null; previous: string | null }>(
            `/products/${query ? `?${query}` : ''}`
        );
    },

    async get(id: string) {
        return apiFetch<any>(`/products/${id}/`);
    },

    async create(data: FormData) {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/products/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: data,
        });

        if (response.status >= 200 && response.status < 300) {
            try {
                return await response.json();
            } catch (parseError) {
                return { success: true };
            }
        }

        const errorData = await response.json().catch(() => ({ detail: 'Failed to create product' }));
        let errorMessage = errorData.detail || errorData.message;

        if (!errorMessage && typeof errorData === 'object' && errorData !== null) {
            const messages = Object.entries(errorData)
                .map(([key, value]) => {
                    const msg = Array.isArray(value) ? value.join(', ') : String(value);
                    return `${key}: ${msg}`;
                })
                .join(' | ');
            if (messages) errorMessage = messages;
        }

        const error = new Error(errorMessage || 'Failed to create product');
        (error as any).response = { data: errorData, status: response.status };
        throw error;
    },

    async update(id: string, data: Partial<any>) {
        return apiFetch<any>(`/products/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    async delete(id: string) {
        return apiFetch<void>(`/products/${id}/`, {
            method: 'DELETE',
        });
    },

    async getAIAnalysis(id: string) {
        return apiFetch<any>(`/products/${id}/ai_analysis/`);
    },

    async getMyListings() {
        return apiFetch<any[]>('/products/my_listings/');
    },
};

// Auctions API
export const auctionsAPI = {
    async list(activeOnly: boolean = false) {
        return apiFetch<any[]>(`/auctions/${activeOnly ? '?active_only=true' : ''}`);
    },

    async get(id: string) {
        return apiFetch<any>(`/auctions/${id}/`);
    },

    async placeBid(id: string, amount: number) {
        return apiFetch<any>(`/auctions/${id}/place_bid/`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },
};

// Profiles API
export const profilesAPI = {
    async getMe() {
        return apiFetch<any>('/profiles/me/');
    },

    async update(data: Partial<any>) {
        return apiFetch<any>('/profiles/me/', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
};

// Wallet API
export const walletAPI = {
    async recharge(amount: number) {
        return apiFetch<{ wallet_balance: number }>('/users/wallet/recharge/', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },
};

// General API
export const generalAPI = {
    async getGeneralStats() {
        return apiFetch<{
            total_users: number;
            products_sold: number;
            scrap_count: number;
            active_governorates: number;
        }>('/general-stats/');
    },
};

// Chat API
export const chatAPI = {
    async getConversations() {
        return apiFetch<any[]>('/conversations/');
    },

    async getConversation(id: number) {
        return apiFetch<any>(`/conversations/${id}/`);
    },

    async startConversation(productId: number) {
        return apiFetch<any>('/conversations/start_conversation/', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId }),
        });
    },

    async sendMessage(conversationId: number, content: string) {
        return apiFetch<any>(`/conversations/${conversationId}/send_message/`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    },

    async getUnreadCount() {
        return apiFetch<{ unread_count: number }>('/conversations/unread_count/');
    },
};

// Wishlist API
export const wishlistAPI = {
    async list() {
        return apiFetch<any[]>('/wishlist/');
    },

    async toggle(productId: number) {
        return apiFetch<{ status: string; is_wishlisted: boolean }>(`/wishlist/toggle/${productId}/`, {
            method: 'POST',
        });
    },

    async check(productId: number) {
        return apiFetch<{ is_wishlisted: boolean }>(`/wishlist/check/${productId}/`);
    },

    async getIds() {
        return apiFetch<{ product_ids: number[] }>('/wishlist/ids/');
    },
};

export const classifyAPI = {
    async classifyImage(file: File): Promise<{
        category: string;
        category_label: string;
        confidence: number;
        detected_class: string | null;
    }> {
        const formData = new FormData();
        formData.append('image', file);

        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/classify-image/`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Classification failed');
        }

        return response.json();
    },
};

// AI Agent API
export const agentAPI = {
    async getTargets() {
        return apiFetch<{ id: string; label: string; label_ar: string; category: string }[]>(
            '/agent-targets/'
        );
    },

    async list() {
        const data = await apiFetch<any>('/agents/');
        // Handle paginated (DRF) or plain array response
        return Array.isArray(data) ? data : (data.results || []);
    },

    async create(data: { target_item: string; max_budget: number; requirements_prompt?: string }) {
        return apiFetch<any>('/agents/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: number, data: Partial<{ target_item: string; max_budget: number; is_active: boolean; requirements_prompt: string }>) {
        return apiFetch<any>(`/agents/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return apiFetch<void>(`/agents/${id}/`, {
            method: 'DELETE',
        });
    },
};

// Notifications API
export const notificationsAPI = {
    async list() {
        const data = await apiFetch<any>('/notifications/');
        return Array.isArray(data) ? data : (data.results || []);
    },

    async markAllRead() {
        return apiFetch<{ status: string }>('/notifications/mark-read/', {
            method: 'POST',
        });
    },

    async unreadCount() {
        return apiFetch<{ unread_count: number }>('/notifications/unread-count/');
    },
};

// RAG Smart Search API
export const ragAPI = {
    async query(queryText: string) {
        return apiFetch<{
            answer: {
                summary: string;
                items: (number | string)[];
                suggested_action: string;
            };
            meta: {
                latency_ms: number;
                sql_results: number;
                vector_results: number;
                merged_results: number;
            };
        }>('/rag/query/', {
            method: 'POST',
            body: JSON.stringify({ query: queryText }),
        });
    },
};
