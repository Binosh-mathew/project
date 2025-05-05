import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User, AuthContextType as BaseAuthContextType, UserRole } from '@/types/auth';
import { authApi } from '@/services/api';
import TokenService from '@/services/tokenService';

export interface ExtendedUser extends User {
  password?: string;
}

export interface ExtendedAuthContextType extends BaseAuthContextType {
  user: ExtendedUser | null;
  register: (name: string, email: string, password: string, role: UserRole, storeInfo?: { storeId: string; storeName: string }) => Promise<void>;
  updateProfile: (userId: string, updates: { name?: string; email?: string }) => Promise<void>;
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
}

const USER_SESSION_KEY = 'printShopUser';

// Create context with default values
const AuthContext = createContext<ExtendedAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  updatePassword: async () => {},
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing user session on load
  const checkAuth = useCallback(async () => {
    try {
      const storedUser = sessionStorage.getItem(USER_SESSION_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Check if token is valid
      if (TokenService.isTokenValid()) {
        // Token is valid, user is authenticated
        setIsLoading(false);
      } else {
        // Token is invalid or expired, try to refresh
        const refreshToken = TokenService.getRefreshToken();
        if (refreshToken) {
          try {
            const response = await authApi.refreshToken(refreshToken);
            const { token, refreshToken: newRefreshToken } = response.data.data;
            TokenService.setToken(token);
            TokenService.setRefreshToken(newRefreshToken);
            setIsLoading(false);
          } catch (error) {
            // Refresh failed, clear session
            handleLogout();
          }
        } else {
          // No refresh token, clear session
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      handleLogout();
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    setUser(null);
    TokenService.clearTokens();
    sessionStorage.removeItem(USER_SESSION_KEY);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (email: string, password: string, role: UserRole = 'user') => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password, role);
      const { token, refreshToken, user, admin, developer } = response.data;
      const userData = user || admin || developer;
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      // Store tokens securely
      TokenService.setToken(token);
      TokenService.setRefreshToken(refreshToken);
      
      // Store user data
      setUser(userData);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.name || userData.email}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || error.message || 'An error occurred during login',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'user',
    storeInfo?: { storeId: string; storeName: string }
  ) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(name, email, password, role, storeInfo);
      const { token, refreshToken, user } = response.data;
      
      if (!user) {
        throw new Error('No user data received');
      }
      
      // Store tokens securely
      TokenService.setToken(token);
      TokenService.setRefreshToken(refreshToken);
      
      // Store user data
      setUser(user);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      
      toast({
        title: 'Registration successful',
        description: `Welcome, ${name}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    handleLogout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  }, [handleLogout, toast]);

  // Update profile function
  const updateProfile = async (userId: string, updates: { name?: string; email?: string }) => {
    try {
      const response = await authApi.updateProfile(userId, updates);
      const updatedUser = response.data.data;
      if (!updatedUser) {
        throw new Error('No updated user data received');
      }
      setUser(updatedUser);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || error.message || 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update password function
  const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    try {
      await authApi.updatePassword(userId, currentPassword, newPassword);
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || error.message || 'Failed to update password',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
