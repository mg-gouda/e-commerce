import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSessionId } from './session';
import { logApiError } from './error-logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log('API Base URL:', API_BASE_URL);

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token or session id
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // For guest users, add session-id header
        const sessionId = getSessionId();
        if (sessionId) {
          config.headers['session-id'] = sessionId;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const endpoint = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'GET';

    // Network error
    if (!error.response) {
      const apiError = new ApiError('Network error. Please check your connection.', 0, undefined, endpoint);
      logApiError(apiError, endpoint, method);
      throw apiError;
    }

    const { status, data } = error.response;
    let apiError: ApiError;

    // Handle specific status codes
    switch (status) {
      case 401:
        // Handle unauthorized access
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        apiError = new ApiError('Unauthorized. Please log in again.', 401, undefined, endpoint);
        break;

      case 403:
        apiError = new ApiError('Access forbidden.', 403, undefined, endpoint);
        break;

      case 404:
        apiError = new ApiError('Resource not found.', 404, undefined, endpoint);
        break;

      case 422:
        // Validation errors
        const validationErrors = (data as { errors?: Record<string, string[]> })?.errors;
        apiError = new ApiError('Validation failed.', 422, validationErrors, endpoint);
        break;

      case 500:
        apiError = new ApiError('Server error. Please try again later.', 500, undefined, endpoint);
        break;

      default:
        const message = (data as { message?: string })?.message || 'An unexpected error occurred.';
        apiError = new ApiError(message, status, undefined, endpoint);
    }

    logApiError(apiError, endpoint, method);
    throw apiError;
  }
);

// Retry configuration for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries = 3,
  delay = 1000
): Promise<AxiosResponse<T>> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (error instanceof ApiError && error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500 &&
            error.statusCode !== 408 && error.statusCode !== 429) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
};

// Typed API methods
export const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config),

  // Methods with retry logic
  getWithRetry: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    retryRequest(() => api.get<T>(url, config)),

  postWithRetry: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    retryRequest(() => api.post<T>(url, data, config)),
};

export { api };
export default api;