import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

// Auth API Services
export const authAPI = {
    login: async (credentials: any) => {
        const formData = new FormData();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await api.post('/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },

    register: async (userData: any) => {
        const response = await api.post('/register', userData);
        return response.data;
    },

    registerLawyer: async (lawyerData: FormData) => {
        const response = await api.post('/lawyers/register', lawyerData, {
            headers: { 'Content-Type': 'multipart/form-data' } // Browser sets boundary automatically with FormData
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    }
};

export const bookingsAPI = {
    createDraft: async (data: any) => {
        const response = await api.post('/bookings/create', data);
        return response.data;
    },
    confirmBooking: async (draftId: string) => {
        const response = await api.post(`/bookings/confirm?booking_draft_id=${draftId}`);
        return response.data;
    },
    getBookings: async (params?: any) => {
        const response = await api.get('/bookings/', { params });
        return response.data;
    },
    getBookingById: async (id: string) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },
    updateStatus: async (id: string, status: string, reason?: string) => {
        const response = await api.patch(`/bookings/${id}/status`, null, {
            params: { status_in: status, reason }
        });
        return response.data;
    }
};

export default api;
