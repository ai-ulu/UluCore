// This file will contain API-related functions and types.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let apiToken: string | null = localStorage.getItem('token');

// --- TYPE DEFINITIONS ---

export interface User {
  id: string;
  email: string;
  name?: string;
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

// --- API HELPER FUNCTIONS ---

const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
    };
};

// --- API OBJECT ---

export const api = {
  setToken: (token: string | null) => {
    apiToken = token;
  },

  login: async (email: string, password: string): Promise<{ access_token: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  signup: async (email: string, password: string, name?: string): Promise<{ access_token: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name }),
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  getEvents: async (): Promise<Event[]> => {
    const response = await fetch(`${API_BASE_URL}/events`, { headers: getAuthHeaders() });
    if (!response.ok) return [];
    return response.json();
  },

  getMetrics: async (): Promise<Metrics> => {
    const response = await fetch(`${API_BASE_URL}/metrics`, { headers: getAuthHeaders() });
    if (!response.ok) return { total_actions: 0, approved_count: 0, rejected_count: 0, reject_rate: 0 };
    return response.json();
  },

  getAPIKeys: async (): Promise<APIKey[]> => {
    const response = await fetch(`${API_BASE_URL}/apikeys`, { headers: getAuthHeaders() });
    if (!response.ok) return [];
    return response.json();
  },

  createAPIKey: async (name: string): Promise<APIKey> => {
    const response = await fetch(`${API_BASE_URL}/apikeys`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create API key');
    return response.json();
  },

  deleteAPIKey: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/apikeys/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
  },

  getPricingPlans: async (): Promise<PricingPlan[]> => {
    // This is mock data as there's no backend endpoint for it yet.
    return Promise.resolve([
        { id: 'free', name: 'Developer', price_monthly: 0, price_yearly: 0, actions_limit: 1000, features: ['Core Policy Engine', 'AI Advisory (Rate Limited)', '1 Project', 'Community Support'] },
        { id: 'pro', name: 'Pro', price_monthly: 79, price_yearly: 790, actions_limit: 50000, features: ['All in Developer', 'Advanced Policies', 'No AI Rate Limit', '5 Projects', 'Email Support'] },
        { id: 'enterprise', name: 'Enterprise', price_monthly: 0, price_yearly: 0, actions_limit: -1, features: ['All in Pro', 'Custom Policies & Integrations', 'Self-Hosted Option', 'Unlimited Projects', 'Dedicated Support & SLA'] },
    ]);
  },
};
