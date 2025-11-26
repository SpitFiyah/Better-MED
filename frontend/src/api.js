import axios from 'axios';

// Dynamic API URL getter
const getBaseUrl = () => {
    return localStorage.getItem('api_url') || 'http://localhost:8000';
};

// Create axios instance (function to get fresh instance with current URL)
const getApiClient = () => {
    const instance = axios.create({
        baseURL: getBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Interceptor to add token
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return instance;
};

const api = {
    // Auth
    login: async (username, password) => {
        const response = await getApiClient().post('/auth/login', { username, password });
        return response.data;
    },
    register: async (username, password, hospital_name) => {
        const response = await getApiClient().post('/auth/register', { username, password, hospital_name });
        return response.data;
    },

    // Core
    verifyBatch: async (batchCode) => {
        const response = await getApiClient().post('/verify', { batch_code: batchCode });
        return response.data;
    },

    // Stats
    getStats: async () => {
        const response = await getApiClient().get('/stats');
        return response.data;
    },
    getHistory: async () => {
        const response = await getApiClient().get('/history');
        return response.data;
    },

    // AI Scan
    scanImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await getApiClient().post('/scan/ai', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default api;
