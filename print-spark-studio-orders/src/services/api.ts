import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { retry } from '@/utils/retry';
import TokenService from './tokenService';
import CsrfService from './csrfService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  validateStatus: (status) => status >= 200 && status < 500,
});

// Add request interceptor for authentication and CSRF
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Add auth token
  const token = TokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token for non-GET requests
  if (config.method !== 'get') {
    try {
      const csrfToken = CsrfService.getStoredCsrfToken();
      if (!csrfToken) {
        await CsrfService.getCsrfToken();
      }
      const headers = new AxiosHeaders(config.headers);
      const headersObj = Object.fromEntries(
        Object.entries(headers.toJSON()).filter(([_, value]) => value !== null)
      ) as Record<string, string>;
      const updatedHeaders = CsrfService.addCsrfTokenToHeaders(headersObj);
      config.headers = new AxiosHeaders(updatedHeaders);
    } catch (error) {
      console.error('Error adding CSRF token:', error);
    }
  }

  return config;
});

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error.message);
      // If it's a network error, we'll retry the request
      if (error.config) {
        return retry(() => api(error.config!));
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = TokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data.data;
        
        // Store the new tokens
        TokenService.setToken(token);
        TokenService.setRefreshToken(newRefreshToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        TokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // If error is not 401 or refresh failed, reject the promise
    return Promise.reject(error);
  }
);

// Store Admin API endpoints
export const storeAdminApi = {
  // Fetch all store admins
  getAllStoreAdmins: () => retry(() => api.get<ApiResponse<StoreAdmin[]>>('/store-admins')),

  // Get store admin by ID
  getStoreAdmin: (id: string) => retry(() => api.get<ApiResponse<StoreAdmin>>(`/store-admins/${id}`)),

  // Update store admin
  updateStoreAdmin: (id: string, data: Partial<StoreAdmin>) => 
    retry(() => api.put<ApiResponse<StoreAdmin>>(`/store-admins/${id}`, data)),

  // Delete store admin
  deleteStoreAdmin: (id: string) => retry(() => api.delete<ApiResponse<void>>(`/store-admins/${id}`)),

  // Reset admin password
  resetAdminPassword: (identifier: string) => 
    retry(() => api.post<ApiResponse<void>>('/store-admins/reset-password', { identifier })),
};

// Auth API endpoints
export const authApi = {
  login: (email: string, password: string, role: string = 'user') => {
    let endpoint = '/auth/login';
    if (role === 'admin') endpoint = '/auth/admin/login';
    if (role === 'developer') endpoint = '/auth/developer/login';
    return retry(() => api.post<ApiResponse<AuthResponse>>(endpoint, { email, password }));
  },
  
  register: (name: string, email: string, password: string, role: string = 'user', storeInfo?: { storeId: string; storeName: string }) => {
    const data: any = { name, email, password, role };
    if (storeInfo) {
      data.storeId = storeInfo.storeId;
      data.storeName = storeInfo.storeName;
    }
    return retry(() => api.post<ApiResponse<AuthResponse>>('/auth/register', data));
  },

  refreshToken: (refreshToken: string) => {
    return retry(() => api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', { refreshToken }));
  },

  updateProfile: (userId: string, updates: { name?: string; email?: string }) => {
    return retry(() => api.put<ApiResponse<User>>(`/auth/profile/${userId}`, updates));
  },

  updatePassword: (userId: string, currentPassword: string, newPassword: string) => {
    return retry(() => api.put<ApiResponse<void>>(`/auth/password/${userId}`, { currentPassword, newPassword }));
  },
};

// Maintenance API endpoints
export const maintenanceApi = {
  getStatus: () => retry(() => api.get<ApiResponse<{ isMaintenanceMode: boolean }>>('/maintenance/status')),
  setStatus: (status: boolean) => retry(() => api.post<ApiResponse<void>>('/maintenance/set', { status })),
  resetStatus: () => retry(() => api.post<ApiResponse<void>>('/maintenance/reset')),
};

// Types
export interface StoreAdmin {
  id: string;
  name: string;
  email: string;
  storeId: string;
  storeName: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    storeId?: string;
    storeName?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  storeId: string;
  documentName: string;
  documentUrl: string;
  copies: number;
  colorType: 'color' | 'blackAndWhite';
  doubleSided: boolean;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  additionalInstructions?: string;
  files: OrderFile[];
}

export interface OrderFile {
  name: string;
  size: number;
  type: string;
  copies: number;
  printType: 'color' | 'blackAndWhite';
  doubleSided: boolean;
  specialPaper: 'none' | 'glossy' | 'matte' | 'transparent';
  binding: {
    needed: boolean;
    type: 'none' | 'spiralBinding' | 'staplingBinding' | 'hardcoverBinding';
  };
}

export interface PricingSettings {
  paperTypes: {
    [key: string]: number;
  };
  bindingTypes: {
    [key: string]: number;
  };
  colorPrinting: number;
  blackAndWhitePrinting: number;
}

// API Methods
export const apiService = {
  // Auth
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: Omit<User, 'id' | 'createdAt'>) => 
    api.post('/auth/register', userData),

  // Users
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  updateUser: (id: string, userData: Partial<User>) => 
    api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),

  // Stores
  getStores: () => api.get<{ data: Store[] }>('/stores'),
  getStore: (id: string) => api.get<{ data: Store }>(`/stores/${id}`),
  createStore: (data: Partial<Store>) => api.post<{ data: Store }>('/stores', data),
  updateStore: (id: string, data: Partial<Store>) => api.put<{ data: Store }>(`/stores/${id}`, data),
  deleteStore: (id: string) => api.delete(`/stores/${id}`),

  // Pricing
  getPricingSettings: () => api.get<PricingSettings>('/pricing'),
  updatePricingSettings: (settings: Partial<PricingSettings>) => 
    api.put('/pricing', settings),
  calculateOrderPrice: (orderData: {
    paperType: string;
    bindingType: string;
    color: boolean;
    pages: number;
  }) => api.post<number>('/pricing/calculate', orderData),

  // Orders
  getOrders: () => api.get<{ data: Order[] }>('/orders'),
  getOrder: (id: string) => api.get<{ data: Order }>(`/orders/${id}`),
  createOrder: (data: Partial<Order>) => api.post<{ data: Order }>('/orders', data),
  updateOrder: (id: string, data: Partial<Order>) => api.put<{ data: Order }>(`/orders/${id}`, data),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),

  // User orders
  getUserOrders: (userId: string) => api.get<{ data: Order[] }>(`/users/${userId}/orders`),
  
  // Store orders
  getStoreOrders: (storeId: string) => api.get<{ data: Order[] }>(`/stores/${storeId}/orders`),
};

export default apiService; 