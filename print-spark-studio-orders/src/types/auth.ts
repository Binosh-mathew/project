export type UserRole = 'user' | 'admin' | 'developer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user?: User;
  admin?: User;
  developer?: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (userId: string, updates: { name?: string; email?: string }) => Promise<void>;
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}