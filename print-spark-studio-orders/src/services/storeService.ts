import { api } from './api';

export interface Store {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  operatingHours: {
    open: string;
    close: string;
  };
  adminId: string;
}

export interface OrderRouting {
  orderId: string;
  storeId: string;
  assignedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreError';
  }
}

export const getStores = async (): Promise<Store[]> => {
  try {
    const response = await api.get('/stores');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw new StoreError('Failed to fetch stores');
  }
};

export const getStoreById = async (storeId: string): Promise<Store> => {
  try {
    const response = await api.get(`/stores/${storeId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching store:', error);
    throw new StoreError('Failed to fetch store');
  }
};

export const routeOrder = async (orderId: string): Promise<OrderRouting> => {
  try {
    if (!orderId) {
      throw new StoreError('Order ID is required');
    }

    const response = await api.post('/orders/route', { orderId });
    return response.data.data;
  } catch (error) {
    console.error('Error routing order:', error);
    throw new StoreError('Failed to route order');
  }
};

export const updateStoreStatus = async (storeId: string, status: 'active' | 'inactive'): Promise<Store> => {
  try {
    const response = await api.put(`/stores/${storeId}/status`, { status });
    return response.data.data;
  } catch (error) {
    console.error('Error updating store status:', error);
    throw new StoreError('Failed to update store status');
  }
};