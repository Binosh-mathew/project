import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  iat: number;
  userId: string;
  role: string;
  [key: string]: any;
}

class TokenService {
  private static TOKEN_KEY = 'auth_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';
  private static TOKEN_EXPIRY_KEY = 'token_expiry';

  // Store token securely
  static setToken(token: string): void {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) {
        throw new Error('Invalid token: missing expiration');
      }

      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      
      // Store token in sessionStorage (more secure than localStorage)
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error setting token:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Store refresh token securely
  static setRefreshToken(refreshToken: string): void {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error setting refresh token:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Get token
  static getToken(): string | null {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiryTime = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (!token || !expiryTime) {
        return null;
      }

      // Check if token is expired
      const now = Date.now();
      if (now > parseInt(expiryTime)) {
        this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Clear all tokens
  static clearTokens(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Check if token is valid
  static isTokenValid(): boolean {
    try {
      const token = this.getToken();
      if (!token) return false;

      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000; // Convert to seconds

      return decoded.exp > now;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  // Get token expiry time
  static getTokenExpiryTime(): number | null {
    try {
      const expiryTime = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
      return expiryTime ? parseInt(expiryTime) : null;
    } catch (error) {
      console.error('Error getting token expiry time:', error);
      return null;
    }
  }

  // Get user role from token
  static getUserRole(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Get user ID from token
  static getUserId(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.userId || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }
}

export default TokenService; 