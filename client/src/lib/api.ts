// Dynamic API URL based on environment
const getApiBaseUrl = () => {
  // Production: Use relative URL when deployed together (Railway single deployment)
  if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    return '/api';  // Relative to same domain
  }
  
  // Check for environment variable (for separate frontend/backend deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development: Fallback to localhost
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Get auth token from localStorage
    let authToken = null;
    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (tokens) {
        const parsedTokens = JSON.parse(tokens);
        authToken = parsedTokens.accessToken;
      }
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
      localStorage.removeItem('auth_tokens');
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making API request:', { url, method: config.method, hasToken: !!authToken });
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API response:', { url, status: response.status, data });

      if (!response.ok) {
        console.error('API Error:', {
          url,
          status: response.status,
          error: data.error,
          hasToken: !!authToken
        });
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(refreshToken?: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/me');
  }

  async updateProfile(data: any) {
    return this.request('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Services endpoints
  async getServices(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/services${queryString ? `?${queryString}` : ''}`);
  }

  async getService(serviceId: string) {
    return this.request(`/services/${serviceId}`);
  }

  async createService(data: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(serviceId: string, data: any) {
    return this.request(`/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(serviceId: string) {
    return this.request(`/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  // Projects endpoints (alias for services for marketplace)
  async getProjects(params?: Record<string, any>) {
    return this.getServices(params);
  }

  async getProject(id: string) {
    return this.getService(id);
  }

  // Hire requests endpoints
  async getHireRequests(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/hires/mine${queryString ? `?${queryString}` : ''}`);
  }

  async createHireRequest(data: any) {
    return this.request('/hires', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async acceptHireRequest(hireId: string) {
    return this.request(`/hires/${hireId}/accept`, {
      method: 'PATCH',
    });
  }

  async rejectHireRequest(hireId: string) {
    return this.request(`/hires/${hireId}/reject`, {
      method: 'PATCH',
    });
  }

  async getHireRequest(hireId: string) {
    return this.request(`/hires/${hireId}`);
  }

  // Orders endpoints
  async getOrders(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/orders/mine${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  async createOrder(data: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Chat endpoints
  async getChatMessages(hireId: string, params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/chat/rooms/${hireId}/messages${queryString ? `?${queryString}` : ''}`);
  }

  async sendMessage(hireId: string, message: string) {
    return this.request(`/chat/rooms/${hireId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async markMessagesAsRead(hireId: string) {
    return this.request(`/chat/rooms/${hireId}/read`, {
      method: 'POST',
    });
  }

  // Contract endpoints
  async createContract(data: any) {
    return this.request('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContract(contractId: string) {
    return this.request(`/contracts/${contractId}`);
  }

  async getUserContracts(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/contracts/user${queryString ? `?${queryString}` : ''}`);
  }

  async signContract(contractId: string, data: any) {
    return this.request(`/contracts/${contractId}/sign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async processPayment(contractId: string) {
    return this.request(`/contracts/${contractId}/payment`, {
      method: 'POST',
    });
  }

  async updateProgress(contractId: string, data: any) {
    return this.request(`/contracts/${contractId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markCompleted(contractId: string, data: any) {
    return this.request(`/contracts/${contractId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reviews endpoints
  async createReview(data: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserReviews(userId: string, params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/reviews/users/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  // Notifications endpoints
  async getNotifications(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Verification endpoints
  async uploadIdCard(idCardUrl: string) {
    return this.request('/verification/upload-id-card', {
      method: 'POST',
      body: JSON.stringify({ idCardUrl }),
    });
  }

  async getVerificationStatus() {
    return this.request('/verification/status');
  }

  async verifyStudent(studentId: string) {
    return this.request(`/verification/verify/${studentId}`, {
      method: 'POST',
    });
  }

  async getPendingVerifications() {
    return this.request('/verification/pending');
  }

  async rejectStudent(studentId: string, reason?: string) {
    return this.request(`/verification/reject/${studentId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async testVerificationEndpoint() {
    return this.request('/verification/health');
  }

  // Admin endpoints
  async getAdminStats(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/admin/stats${queryString ? `?${queryString}` : ''}`);
  }

  async getAllMessages(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/admin/messages${queryString ? `?${queryString}` : ''}`);
  }

  async getAllServices(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/admin/services${queryString ? `?${queryString}` : ''}`);
  }

  // Public version for homepage (no authentication required)
  async getPublicTopSelectionServices() {
    return this.request('/public/top-selections');
  }

  // Public version for homepage (no authentication required)
  async getPublicServices(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    
    try {
      const response = await this.request(`/public/services${queryString ? `?${queryString}` : ''}`);
      console.log('🔍 getPublicServices response:', response);
      return response;
    } catch (error) {
      console.error('❌ getPublicServices error:', error);
      throw error;
    }
  }

  // Admin version (requires authentication)
  async getTopSelectionServices() {
    return this.request('/admin/services/top-selections');
  }

  async updateTopSelection(serviceId: string, isTopSelection: boolean) {
    return this.request('/admin/services/top-selection', {
      method: 'PATCH',
      body: JSON.stringify({ serviceId, isTopSelection }),
    });
  }

  // Get full conversation for a service
  async getServiceConversation(serviceId: string) {
    return this.request(`/admin/services/${serviceId}/conversation`);
  }
}

export const api = new ApiClient();
export default api;