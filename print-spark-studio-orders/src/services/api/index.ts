import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const response = error.response?.data as ApiErrorResponse;
    return new ApiError(
      response?.message || error.message || 'An unexpected error occurred',
      response?.status || error.response?.status || 500,
      response?.code
    );
  }
}

interface ApiErrorResponse {
  message: string;
  status: number;
  code?: string;
  success: false;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: true;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiRequestConfig<T = any> extends InternalAxiosRequestConfig {
  validateStatus?: (status: number) => boolean;
  transformResponse?: (data: T) => T;
}

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handling interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const apiResponse = response.data as ApiResponse<unknown>;
    if (!apiResponse.success) {
      throw new ApiError(
        apiResponse.message,
        apiResponse.status,
        (apiResponse as ApiErrorResponse).code
      );
    }
    return response;
  },
  (error: AxiosError) => {
    throw ApiError.fromAxiosError(error);
  }
);

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(new ApiError('Request configuration error', 500));
  }
);

export interface Order {
  id: string;
  storeId: string;
  userId: string;
  price: number;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export const orderApi = {
  create: (data: Partial<Order>) => 
    api.post<ApiResponse<Order>>('/orders', data),
  list: (params?: { status?: string; page?: number; limit?: number }) => 
    api.get<ApiResponse<Order[]>>('/orders', { params }),
  get: (id: string) => 
    api.get<ApiResponse<Order>>(`/orders/${id}`),
  update: (id: string, data: Partial<Order>) => 
    api.put<ApiResponse<Order>>(`/orders/${id}`, data),
  delete: (id: string) => 
    api.delete<ApiResponse<void>>(`/orders/${id}`)
};

export interface Store {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  adminId: string;
}

export const storeApi = {
  list: () => 
    api.get<ApiResponse<Store[]>>('/stores'),
  get: (id: string) => 
    api.get<ApiResponse<Store>>(`/stores/${id}`),
  getOrders: (id: string) => 
    api.get<ApiResponse<Order[]>>(`/stores/${id}/orders`)
};

interface Message {
  id: string;
  userId: string;
  content: string;
  type: 'notification' | 'alert' | 'message';
  read: boolean;
  createdAt: string;
}

export const messageApi = {
  list: () => 
    api.get<ApiResponse<Message[]>>('/messages'),
  send: (data: Omit<Message, 'id' | 'createdAt' | 'read'>) => 
    api.post<ApiResponse<Message>>('/messages', data),
  markRead: (id: string) => 
    api.put<ApiResponse<Message>>(`/messages/${id}/read`)
};