import axios from 'axios';
import {getAuthToken} from "@/utils/auth.tsx";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem('authToken');
        const token = getAuthToken();

        console.log(token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            // localStorage.removeItem('authToken');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Dashboard API endpoints
export const dashboardAPI = {
    getDashboard: () => api.get('/dashboard'),
};

// Add this to your existing api.js file

export const verificationAPI = {
    // Verify identity
    verify: (data: any) => {
        return api.post('/kyc/verify-id', data);
    },
    verifyBusiness: (data: any) => {
        return api.post('/kyc/verify-business', data);
    },
    getBusinessShareholders: (data: any) => {
        return api.post('/kyc/business-holder', data);
    },

    // Get verification history
    getHistory: (params = {}) => {
        return api.get('/history', { params });
    },

    // Get verification by ID
    // getById: (id) => {
    //     return api.get(`/verifications/${id}`);
    // },

    // Get verification statistics
    // getStats: () => {
    //     return api.get('/verifications/stats');
    // }
};

export default api;
