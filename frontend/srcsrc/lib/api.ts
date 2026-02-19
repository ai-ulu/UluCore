// This file will contain API-related functions and types.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- TYPE DEFINITIONS ---

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Event {
  id: string;
  decision: 'approve' | 'reject';
  action_type: string;
  resource_id: string;
  reason: string;
  ai_available: boolean;
  timestamp: string;
}

export interface Metrics {
  total_actions: number;
  approved_count: number;
  rejected_count: number;
  reject_rate: number;
}

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  key?: string; // The full key is only returned on creation
}

export interface PricingPlan {
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
    actions_limit: number;
    features: string[];
}

// --- API CLIENT CLASS ---

class APIClient {
  private token: string | null = localStorage.getItem('token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
  }

  // Adjusted to match the backend's form data requirement for login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(error.detail || 'Login failed');
    }
    const data = await response.json();
    // The user object might be nested, let's assume it is for now.
    // This part might need adjustment based on actual backend response.
    return { access_token: data.access_token, token_type: data.token_type, user: data.user || { id: '', email: email } };
  }

  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: name }),
    });
  }

  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events');
  }

  async getMetrics(): Promise<Metrics> {
    return this.request<Metrics>('/metrics');
  }

  async getAPIKeys(): Promise<APIKey[]> {
    return this.request<APIKey[]>('/apikeys');
  }

  async createAPIKey(name: string): Promise<APIKey> {
    return this.request<APIKey>('/apikeys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteAPIKey(id: string): Promise<void> {
    return this.request<void>(`/apikeys/${id}`, {
      method: 'DELETE',
    });
  }

  async getPricingPlans(): Promise<PricingPlan[]> {
    // Mock data, as backend endpoint doesn't exist
    return Promise.resolve([
        { id: 'free', name: 'Developer', price_monthly: 0, price_yearly: 0, actions_limit: 1000, features: ['Core Policy Engine', 'AI Advisory (Rate Limited)', '1 Project', 'Community Support'] },
        { id: 'pro', name: 'Pro', price_monthly: 79, price_yearly: 790, actions_limit: 50000, features: ['All in Developer', 'Advanced Policies', 'No AI Rate Limit', '5 Projects', 'Email Support'] },
        { id: 'enterprise', name: 'Enterprise', price_monthly: 0, price_yearly: 0, actions_limit: -1, features: ['All in Pro', 'Custom Policies & Integrations', 'Self-Hosted Option', 'Unlimited Projects', 'Dedicated Support & SLA'] },
    ]);
  }
}

export const api = new APIClient();
