function parseApiUrl(url: string): { baseUrl: string; basicAuth: string | null } {
  try {
    const parsed = new URL(url);
    if (parsed.username && parsed.password) {
      const basicAuth = btoa(`${parsed.username}:${parsed.password}`);
      parsed.username = '';
      parsed.password = '';
      return { baseUrl: parsed.toString().replace(/\/$/, ''), basicAuth };
    }
    return { baseUrl: url, basicAuth: null };
  } catch {
    return { baseUrl: url, basicAuth: null };
  }
}

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const { baseUrl: API_URL, basicAuth: BASIC_AUTH } = parseApiUrl(rawApiUrl);

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface Event {
  id: string;
  action_type: string;
  resource_id: string;
  user_id: string;
  decision: 'approve' | 'reject';
  reason: string;
  ai_recommendation: string | null;
  ai_available: boolean;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

interface Metrics {
  total_actions: number;
  approved_count: number;
  rejected_count: number;
  reject_rate: number;
  ai_unavailable_count: number;
}

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  key?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  actions_limit: number;
}

class APIClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else if (BASIC_AUTH) {
      headers['Authorization'] = `Basic ${BASIC_AUTH}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getEvents(limit = 100, offset = 0): Promise<Event[]> {
    return this.request<Event[]>(`/events?limit=${limit}&offset=${offset}`);
  }

  async getMetrics(): Promise<Metrics> {
    return this.request<Metrics>('/metrics');
  }

  async getAPIKeys(): Promise<APIKey[]> {
    return this.request<APIKey[]>('/api-keys');
  }

  async createAPIKey(name: string): Promise<APIKey> {
    return this.request<APIKey>('/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteAPIKey(id: string): Promise<void> {
    return this.request<void>(`/api-keys/${id}`, {
      method: 'DELETE',
    });
  }

  async getPricingPlans(): Promise<PricingPlan[]> {
    return this.request<PricingPlan[]>('/billing/plans');
  }

  async getSubscription(): Promise<{ plan: string; status: string; actions_used: number; actions_limit: number }> {
    return this.request('/billing/subscription');
  }
}

export const api = new APIClient();
export type { User, AuthResponse, Event, Metrics, APIKey, PricingPlan };
