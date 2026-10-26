import { Category, Order, Product, SellerProfile, User } from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('dastkar_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
      throw new Error(errorMessage);
    }

    return data;
  }

  // Auth endpoints
  async login(payload: { email: string; password: string }): Promise<{ data: { user: User; token: string } }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'buyer' | 'seller';
    business_name?: string;
    craft_description?: string;
    location_city?: string;
  }): Promise<{ data: { user: User; token: string } }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe(): Promise<{ data: { user: User } }> {
    return this.request('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('dastkar_token');
    }
  }

  // Catalog endpoints
  async getCategories(): Promise<{ data: Category[] }> {
    return this.request('/categories');
  }

  async getProducts(params: Record<string, any> = {}): Promise<{ data: Product[]; meta: any }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/products${qs}`);
  }

  async getFeaturedProducts(): Promise<{ data: Product[] }> {
    return this.request('/products/featured');
  }

  async getProductBySlug(slug: string): Promise<{ data: { product: Product; related: Product[] } }> {
    return this.request(`/products/${slug}`);
  }

  async getMakers(): Promise<{ data: SellerProfile[]; meta: any }> {
    return this.request('/makers');
  }

  async getMakerBySlug(slug: string): Promise<{ data: SellerProfile }> {
    return this.request(`/makers/${slug}`);
  }

  // Internal Discovery & Ranking Endpoints
  async getTrendingProducts(limit: number = 8): Promise<{ data: Product[]; meta: any }> {
    return this.request(`/discovery/trending?limit=${limit}`);
  }

  async getNewArrivals(limit: number = 8): Promise<{ data: Product[]; meta: any }> {
    return this.request(`/discovery/new-arrivals?limit=${limit}`);
  }

  async getBestSellers(limit: number = 8): Promise<{ data: Product[]; meta: any }> {
    return this.request(`/discovery/best-sellers?limit=${limit}`);
  }

  async getRecommendedProducts(params: { category?: string; limit?: number } = {}): Promise<{ data: Product[]; meta: any }> {
    const qs = new URLSearchParams();
    if (params.category) qs.append('category', params.category);
    if (params.limit) qs.append('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.request(`/discovery/recommended${query}`);
  }

  async getNewMakers(limit: number = 6): Promise<{ data: SellerProfile[]; meta: any }> {
    return this.request(`/discovery/new-makers?limit=${limit}`);
  }

  async getDiscoveryConfig(): Promise<{ data: any }> {
    return this.request('/discovery/config');
  }

  async trackDiscoveryEvent(payload: {
    event_type: string;
    surface: string;
    product_id?: number;
    seller_id?: number;
    category_id?: number;
    position?: number;
    metadata?: any;
  }): Promise<void> {
    try {
      let sessionId = localStorage.getItem('dastkar_session_id');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('dastkar_session_id', sessionId);
      }

      await this.request('/discovery/events', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          session_id: sessionId,
        }),
      });
    } catch {
      // Background telemetry failure should never block UI
    }
  }

  // Checkout endpoints
  async getQuote(payload: {
    items: Array<{
      product_id: number;
      variant_id?: number | null;
      quantity: number;
      customization?: Record<string, string> | null;
    }>;
    shipping_method?: string;
  }): Promise<{ data: any }> {
    return this.request('/checkout/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async placeOrder(payload: {
    items: Array<{
      product_id: number;
      variant_id?: number | null;
      quantity: number;
      customization?: Record<string, string> | null;
    }>;
    shipping_method: string;
    payment_method: string;
    shipping_address: {
      full_name: string;
      phone: string;
      address_line1: string;
      address_line2?: string;
      city: string;
      postal_code?: string;
    };
    notes?: string;
  }): Promise<{ data: Order; message: string }> {
    return this.request('/checkout/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Buyer Orders
  async getOrders(): Promise<{ data: Order[] }> {
    return this.request('/orders');
  }

  async getOrderByNumber(orderNumber: string): Promise<{ data: Order }> {
    return this.request(`/orders/${orderNumber}`);
  }

  async submitReview(orderNumber: string, payload: {
    product_id: number;
    rating: number;
    comment: string;
  }): Promise<{ data: any; message: string }> {
    return this.request(`/orders/${orderNumber}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Seller Dashboard
  async getSellerStats(): Promise<{ data: any }> {
    return this.request('/seller/stats');
  }

  async getSellerProducts(): Promise<{ data: Product[]; meta: any }> {
    return this.request('/seller/products');
  }

  async createSellerProduct(payload: any): Promise<{ data: Product; message: string }> {
    return this.request('/seller/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSellerProduct(id: number, payload: any): Promise<{ data: Product; message: string }> {
    return this.request(`/seller/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteSellerProduct(id: number): Promise<{ message: string }> {
    return this.request(`/seller/products/${id}`, {
      method: 'DELETE',
    });
  }

  async generateAiListing(payload: { notes: string; category_id?: number }): Promise<{ data: any; message: string }> {
    return this.request('/seller/ai/generate-listing', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSellerOrders(status?: string): Promise<{ data: any[]; meta: any }> {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/seller/orders${qs}`);
  }

  async updateOrderItemStatus(id: number, status: string): Promise<{ data: any; message: string }> {
    return this.request(`/seller/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Admin Console
  async getAdminStats(): Promise<{ data: any }> {
    return this.request('/admin/stats');
  }

  async verifySeller(id: number, status: string): Promise<{ data: any; message: string }> {
    return this.request(`/admin/sellers/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verification_status: status }),
    });
  }
}

export const api = new ApiClient();
