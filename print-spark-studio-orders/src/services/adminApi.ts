import { api } from './api';

export const adminApi = {
  list: () => api.get('/admins'),
  update: (id: string, data: any) => api.put(`/admins/${id}`, data),
  delete: (id: string) => api.delete(`/admins/${id}`),
  resetPassword: (identifier: string) => api.post('/admins/reset-password', { identifier }),
}; 