import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
      withCredentials: true, // Send httpOnly cookies cross-origin
    });

    // Request interceptor - Add auth token + CSRF token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          // Auth: Bearer token from localStorage (fallback for non-cookie auth)
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // CSRF: Read csrf_token cookie and set as header
          const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
            ?.split('=')[1];
          if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            localStorage.setItem('access_token', data.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.clear();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Expose axios instance for direct use
  get axios() {
    return this.client;
  }

  // Helper method for GET requests
  async get(url: string, config?: any) {
    return this.client.get(url, config);
  }

  // Helper method for POST requests
  async post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config);
  }

  // Helper method for PUT requests
  async put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config);
  }

  // Helper method for DELETE requests
  async delete(url: string, config?: any) {
    return this.client.delete(url, config);
  }

  // ============ AUTH ENDPOINTS ============

  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    user_type: 'user' | 'lawyer';
  }) {
    return this.post('/auth/register', {
      full_name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      user_type: userData.user_type,
    });
  }

  async login(email_or_phone: string, password: string) {
    // Handling FormData for OAuth2PasswordRequestForm compatibility on backend if needed,
    // or JSON if backend supports it. The previous implementation used FormData.
    // Let's support both but default to what the prompt suggested (JSON object) 
    // AND the FormData version from previous implementation just in case.

    // Using JSON endpoint for simpler integration
    return this.post('/auth/login-json', { username: email_or_phone, password });
  }

  async verifyOTP(user_id: string, email_otp: string, phone_otp: string) {
    return this.post('/auth/verify-otp', { user_id, email_otp, phone_otp });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getMe() {
    return this.get('/users/me'); // Changed to /users/me to match previous implementation
  }

  // ============ LOCATION ENDPOINTS ============

  async getStates() {
    return this.get('/locations/states');
  }

  async getDistricts(state_id: string) {
    return this.get(`/locations/states/${state_id}/districts`);
  }

  // ============ LAWYER ENDPOINTS ============

  async searchLawyers(params: any) {
    return this.get('/lawyers/search', { params });
  }

  async getLawyer(lawyer_id: string) {
    return this.get(`/lawyers/${lawyer_id}`);
  }

  async getFeaturedLawyers(limit: number = 6) {
    return this.get('/lawyers/featured', { params: { limit } });
  }

  async registerLawyer(formData: FormData) {
    return this.post('/lawyers/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // ============ BOOKING ENDPOINTS ============

  async createBooking(data: any) {
    return this.post('/bookings/create', data);
  }

  async confirmBooking(booking_draft_id: string) {
    // Matches previous implementation query param style if needed, or body
    return this.post(`/bookings/confirm?booking_draft_id=${booking_draft_id}`);
  }

  async getUserBookings(status?: string) {
    return this.get('/bookings/', { params: { status } });
  }

  // ============ PLATFORM STATS ============

  async getPlatformStats() {
    return this.get('/stats/platform');
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;

// Compatibility Exports for existing code
export const authAPI = {
  login: async (credentials: any) => {
    return api.login(credentials.email, credentials.password);
  },
  register: async (userData: any) => {
    return api.register(userData);
  },
  registerLawyer: async (formData: FormData) => {
    return api.registerLawyer(formData);
  },
  getCurrentUser: async () => {
    return api.getMe();
  }
};

export const bookingsAPI = {
  createDraft: async (data: any) => {
    return api.createBooking(data).then(res => res.data);
  },
  confirmBooking: async (draftId: string) => {
    return api.confirmBooking(draftId).then(res => res.data);
  },
  getBookings: async (params?: any) => {
    return api.axios.get('/bookings/', { params }).then(res => res.data);
  },
  getBookingById: async (id: string) => {
    return api.axios.get(`/bookings/${id}`).then(res => res.data);
  },
  updateStatus: async (id: string, status: string, reason?: string) => {
    return api.axios.patch(`/bookings/${id}/status`, null, {
      params: { status_in: status, reason }
    }).then(res => res.data);
  }
};
