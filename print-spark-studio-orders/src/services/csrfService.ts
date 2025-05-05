import { api } from './api';

class CsrfService {
  private static CSRF_TOKEN_KEY = 'csrf_token';
  private static CSRF_HEADER = 'X-CSRF-Token';

  // Get CSRF token from server
  static async getCsrfToken(): Promise<string> {
    try {
      const response = await api.get<{ token: string }>('/auth/csrf-token');
      const { token } = response.data.data;
      sessionStorage.setItem(this.CSRF_TOKEN_KEY, token);
      return token;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    }
  }

  // Get stored CSRF token
  static getStoredCsrfToken(): string | null {
    return sessionStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  // Clear CSRF token
  static clearCsrfToken(): void {
    sessionStorage.removeItem(this.CSRF_TOKEN_KEY);
  }

  // Add CSRF token to request headers
  static addCsrfTokenToHeaders(headers: Record<string, string>): Record<string, string> {
    const token = this.getStoredCsrfToken();
    if (token) {
      headers[this.CSRF_HEADER] = token;
    }
    return headers;
  }
}

export default CsrfService; 