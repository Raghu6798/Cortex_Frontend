// lib/apiClient.ts
// API client configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://qgk3bzwknxgc2o347buk6d2ra40lhnfx.lambda-url.us-east-1.on.aws';

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
}

export interface Secret {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SecretCreate {
  name: string;
  value: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // This private method handles all requests, including auth
  private async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    // Construct the full URL. Handles both relative and absolute endpoints.
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    console.log('[ApiClient] Making request to:', url);
    console.log('[ApiClient] Base URL:', this.baseUrl);
    console.log('[ApiClient] Endpoint:', endpoint);

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // If a token exists, add it to the Authorization header
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers, // Allow overriding default headers
      },
    });
    
    console.log('[ApiClient] Response status:', response.status);
    console.log('[ApiClient] Response OK:', response.ok);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[ApiClient] API Error Response:", errorBody);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    // Handle responses that might not have a JSON body
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return Promise.resolve() as Promise<T>;
  }

  

  // Public GET method
  async get<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, token);
  }

  // Public POST method
  async post<T>(endpoint: string, data: Record<string, unknown>, options: RequestInit = {}, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  // --- Your specific provider endpoints can now use these helpers ---

  async getProviders(token?: string): Promise<Provider[]> {
    return this.get<Provider[]>('/api/v1/providers', {}, token);
  }

  async testChatCompletion(providerId: string, requestBody: Record<string, unknown>, token?: string): Promise<Record<string, unknown>> {
    return this.post(`/api/v1/providers/${providerId}/chat`, requestBody, {}, token);
  }

  // --- Secrets Management ---
  async createSecret(secretData: SecretCreate, token?: string): Promise<Secret> {
    return this.post<Secret>('/api/v1/secrets/', secretData as unknown as Record<string, unknown>, {}, token);
  }

  async getSecrets(token?: string): Promise<Secret[]> {
    return this.get<Secret[]>('/api/v1/secrets/', {}, token);
  }

  async deleteSecret(secretId: string, token?: string): Promise<void> {
    return this.request<void>(`/api/v1/secrets/${secretId}`, { method: 'DELETE' }, token);
  }
}

export const apiClient = new ApiClient();
export default apiClient;