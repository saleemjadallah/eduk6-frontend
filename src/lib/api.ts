import type { MenuItem, Subscription, UsageInfo, User, EstablishmentSettings } from '@/types';

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
const API_URL = `${API_BASE}/api`;

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const message =
        (error && (error.message || error.error)) || response.statusText || 'Request failed';
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth endpoints
  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.request<User>('/auth/me');
    } catch {
      return null;
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<{ message: string; email: string }> {
    return this.request<{ message: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  }

  async verifyRegistration(email: string, code: string): Promise<User> {
    return this.request<User>('/auth/verify-registration', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async login(email: string, password: string): Promise<User> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async requestLoginOtp(email: string): Promise<void> {
    await this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async loginWithOtp(email: string, code: string): Promise<User> {
    return this.request<User>('/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menu-items');
  }

  async getMenuItem(id: string): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu-items/${id}`);
  }

  async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'userId'>): Promise<MenuItem> {
    return this.request<MenuItem>('/menu-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteMenuItem(id: string): Promise<void> {
    await this.request(`/menu-items/${id}`, { method: 'DELETE' });
  }

  async generateDescription(data: {
    name: string;
    ingredients?: string[];
    description?: string;
  }): Promise<{ description: string }> {
    return this.request('/menu-items/generate-description', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPublicMenu(userId: string): Promise<Record<string, any[]>> {
    return this.request(`/menu-items/public/${userId}`);
  }

  // Image Generation
  async generateImages(data: {
    menuItemId: string;
    style: string;
    dishName: string;
    description?: string;
    ingredients?: string[];
  }): Promise<{ images: string[]; menuItem: MenuItem }> {
    return this.request('/generate-images', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateHighResImages(data: {
    menuItemId: string;
    style: string;
    dishName: string;
    indices: number[];
    description?: string;
    ingredients?: string[];
  }): Promise<{ images: string[]; menuItem: MenuItem; updatedIndices: number[] }> {
    return this.request('/generate-images/highres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async finalizeDish(menuItemId: string, data: {
    images: string[];
    selectedStyle: string;
    action: 'save' | 'download';
    name?: string;
    description?: string | null;
    ingredients?: string[] | null;
    category?: string;
    price?: string | null;
    dietaryInfo?: string[] | null;
    allergens?: string[] | null;
  }): Promise<{ menuItem: MenuItem; action: string; success: boolean }> {
    return this.request(`/menu-items/${menuItemId}/finalize`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Maintenance
  async fixMenuCategories(): Promise<{ success: boolean; message: string; fixedItems: any[] }> {
    return this.request('/maintenance/fix-menu-categories', {
      method: 'POST',
    });
  }

  // Subscriptions
  async getCurrentSubscription(): Promise<Subscription | null> {
    return this.request<Subscription | null>('/subscriptions/current');
  }

  async createSubscription(tier: string): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  }

  async createSubscriptionIntent(tier: string): Promise<{
    subscriptionId: string;
    clientSecret: string;
    tier: string;
    resumed?: boolean;
  }> {
    return this.request('/create-subscription-intent', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  }

  async syncSubscription(): Promise<{ synced: boolean; subscription?: Subscription; message: string }> {
    return this.request('/subscriptions/sync', {
      method: 'POST',
    });
  }

  // Usage
  async getCurrentUsage(): Promise<UsageInfo> {
    return this.request<UsageInfo>('/usage/current');
  }

  // Subscription Management
  async getSubscription(): Promise<Subscription | null> {
    try {
      return await this.request<Subscription>('/subscription');
    } catch {
      return null;
    }
  }

  async createPortalSession(): Promise<{ url: string }> {
    return this.request<{ url: string }>('/create-portal-session', {
      method: 'POST',
    });
  }

  // User Profile
  async updateProfile(data: { firstName: string; lastName: string }): Promise<User> {
    return this.request<User>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Establishment Settings
  async getEstablishmentSettings(): Promise<EstablishmentSettings> {
    return this.request<EstablishmentSettings>('/establishment-settings');
  }

  async updateEstablishmentSettings(data: Partial<EstablishmentSettings>): Promise<EstablishmentSettings> {
    return this.request<EstablishmentSettings>('/establishment-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPublicEstablishmentSettings(userId: string): Promise<Partial<EstablishmentSettings>> {
    return this.request<Partial<EstablishmentSettings>>(`/establishment-settings/public/${userId}`);
  }
}

export const api = new ApiClient();
