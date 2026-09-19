/**
 * API Client
 * 
 * Handles all HTTP requests to the backend API
 */

import { logger } from '../utils/logger';
import { errorHandler, AuthenticationError, AppError } from '../utils/errorHandler';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private static instance: ApiClient;
  private token: string | null = null;

  private constructor() {
    // Load token from storage
    this.token = sessionStorage.getItem('auth_token');
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public setToken(token: string): void {
    this.token = token;
    sessionStorage.setItem('auth_token', token);
  }

  public clearToken(): void {
    this.token = null;
    sessionStorage.removeItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (response.status === 401) {
        this.clearToken();
        throw new AuthenticationError(error.error || 'Session expired');
      }

      throw new AppError(
        error.error || 'Request failed',
        response.status,
        response.status < 500
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      logger.debug(`API GET: ${endpoint}`, 'ApiClient', { params });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      errorHandler.handleError(error as Error, 'ApiClient');
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      logger.debug(`API POST: ${endpoint}`, 'ApiClient', { data });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      errorHandler.handleError(error as Error, 'ApiClient');
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      logger.debug(`API PUT: ${endpoint}`, 'ApiClient', { data });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      errorHandler.handleError(error as Error, 'ApiClient');
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      logger.debug(`API DELETE: ${endpoint}`, 'ApiClient');

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      errorHandler.handleError(error as Error, 'ApiClient');
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = ApiClient.getInstance();

// API Endpoints
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<{ token: string; user: any }>('/auth/login', { email, password }),
  },

  // Issues
  issues: {
    getAll: (params?: Record<string, string>) =>
      apiClient.get<any[]>('/issues', params),
    getById: (id: string) =>
      apiClient.get<any>(`/issues/${id}`),
    create: (data: any) =>
      apiClient.post<any>('/issues', data),
    update: (id: string, data: any) =>
      apiClient.put<any>(`/issues/${id}`, data),
    delete: (id: string) =>
      apiClient.delete<any>(`/issues/${id}`),
  },

  // Branches
  branches: {
    getAll: () =>
      apiClient.get<any[]>('/branches'),
  },

  // Users
  users: {
    getAll: () =>
      apiClient.get<any[]>('/users'),
  },

  // Stats
  stats: {
    getIssueStats: () =>
      apiClient.get<any>('/stats/issues'),
  },
};
