// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Provider {
  id: string;
  name: string;
  display_name: string;
  base_url: string;
  logo_url?: string;
  description?: string;
  requires_api_key: boolean;
  supports_streaming: boolean;
  supports_tools: boolean;
  supports_embeddings: boolean;
  max_tokens: number;
  models: Model[];
}

export interface Model {
  id: string;
  model_id: string;
  display_name: string;
  description?: string;
  context_length: number;
  input_cost_per_token: number;
  output_cost_per_token: number;
  is_active: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get auth token from Clerk (if available)
    const token = typeof window !== 'undefined' ? 
      (window as any).__clerk?.session?.getToken?.() : null;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Provider endpoints
  async getProviders(): Promise<Provider[]> {
    return this.request<Provider[]>('/api/v1/providers');
  }

  async getProviderModels(providerId: string): Promise<Model[]> {
    return this.request<Model[]>(`/api/v1/providers/${providerId}/models`);
  }

  async syncProviders(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/providers/sync', {
      method: 'POST',
    });
  }

  async testProvider(providerId: string): Promise<{
    provider: string;
    status: string;
    models_count: number;
    models: Array<{ id: string; name: string }>;
  }> {
    return this.request(`/api/v1/providers/${providerId}/test`);
  }

  async testChatCompletion(providerId: string, request: {
    messages: Array<{ role: string; content: string }>;
    model: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<any> {
    return this.request(`/api/v1/providers/${providerId}/chat`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;