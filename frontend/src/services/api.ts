import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  Review,
  ReviewResponse,
  ReviewListResponse,
  CodeSubmission,
  StatsResponse,
  HealthCheck,
  ReviewFilters,
  ExportFilters,
  ApiError,
  LoginRequest,
  RegisterRequest,
  AuthToken,
  User
} from '../types/api';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthToken = (): string | null => {
  return localStorage.getItem('codereviewer_token');
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorData = error.response?.data as any;
    const apiError: ApiError = {
      message: errorData?.detail || error.message,
      status: error.response?.status,
      details: error.response?.data,
    };

    if (error.response?.status === 401) {
      // Only clear auth data if it's not a login/register endpoint
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('codereviewer_token');
        localStorage.removeItem('codereviewer_user');
        window.dispatchEvent(new Event('auth-logout'));
      }
    } else if (error.response?.status === 429) {
      apiError.message = errorData?.detail || 'Rate limit exceeded. Please try again later.';
    } else if (error.response?.status === 500) {
      apiError.message = errorData?.detail || 'Server error. Please try again.';
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Request timeout. Check your connection.';
    }

    return Promise.reject(apiError);
  }
);

if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((request) => {
    console.log('API Request:', request.method?.toUpperCase(), request.url);
    return request;
  });
}

export class ApiService {
  
  static async login(credentials: LoginRequest): Promise<AuthToken> {
    const response: AxiosResponse<AuthToken> = await api.post('/auth/login', credentials);
    return response.data;
  }

  static async register(userData: RegisterRequest): Promise<AuthToken> {
    const response: AxiosResponse<AuthToken> = await api.post('/auth/register', userData);
    return response.data;
  }

  static async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await api.get('/auth/profile');
    return response.data;
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  static async submitReview(submission: CodeSubmission): Promise<ReviewResponse> {
    const response: AxiosResponse<ReviewResponse> = await api.post('/reviews', submission);
    return response.data;
  }

  static async getReview(reviewId: string): Promise<Review> {
    const response: AxiosResponse<Review> = await api.get(`/reviews/${reviewId}`);
    return response.data;
  }

  static async listReviews(filters: ReviewFilters = {}): Promise<ReviewListResponse> {
    const response: AxiosResponse<ReviewListResponse> = await api.get('/reviews', {
      params: filters
    });
    return response.data;
  }

  static async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  }

  static async exportReviewsCSV(filters: ExportFilters): Promise<Blob> {
    const response: AxiosResponse<Blob> = await api.get('/reviews/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  static async getStatistics(): Promise<StatsResponse> {
    const response: AxiosResponse<StatsResponse> = await api.get('/stats');
    return response.data;
  }

  static async getStatsSummary(): Promise<any> {
    const response = await api.get('/stats/summary');
    return response.data;
  }

  static async getLanguageStats(): Promise<any> {
    const response = await api.get('/stats/languages');
    return response.data;
  }

  static async getTrends(): Promise<any> {
    const response = await api.get('/stats/trends');
    return response.data;
  }

  static async getCommonIssues(): Promise<any> {
    const response = await api.get('/stats/issues');
    return response.data;
  }

  static async exportStatsCSV(): Promise<Blob> {
    const response: AxiosResponse<Blob> = await api.get('/stats/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  }

  static async getHealth(): Promise<HealthCheck> {
    const response: AxiosResponse<HealthCheck> = await api.get('/health');
    return response.data;
  }

  static async getDetailedHealth(): Promise<any> {
    const response = await api.get('/health/detailed');
    return response.data;
  }

  static async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static async pollReviewStatus(
    reviewId: string,
    onUpdate: (review: Review) => void,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<Review> {
    let attempts = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    const start_time = Date.now();
    
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const poll = async () => {
        try {
          attempts++;
          console.log(`[POLLING] Attempt ${attempts}/${maxAttempts} for review ${reviewId}`);
          
          const review = await this.getReview(reviewId);
          onUpdate(review);
          
          if (review.status === 'completed' || review.status === 'failed') {
            console.log(`[POLLING] Finalizando polling - Status: ${review.status}`);
            cleanup();
            resolve(review);
            return;
          }
          
          if (review.error_message) {
            console.log(`[POLLING] Review with error detected, stopping polling`);
            cleanup();
            resolve(review);
            return;
          }
          
          if (attempts >= maxAttempts) {
            console.log(`[POLLING] Timeout - maximum attempts (${maxAttempts}) reached`);
            cleanup();
            reject(new Error(`Timeout waiting for review completion after ${maxAttempts} attempts`));
            return;
          }
          
          if (review.status === 'pending' || review.status === 'in_progress') {
            const elapsedTime = Date.now() - start_time;
            if (elapsedTime > 300000) {
              console.log(`[POLLING] Safety timeout (5min) reached`);
              cleanup();
              reject(new Error('Safety timeout reached'));
              return;
            }
            timeoutId = setTimeout(poll, intervalMs);
          } else {
            console.log(`[POLLING] Unknown status (${review.status}), stopping polling`);
            cleanup();
            resolve(review);
          }
        } catch (error) {
          console.error(`[POLLING] Error on attempt ${attempts}:`, error);
          cleanup();
          reject(error);
        }
      };
      
      poll();
      
      const originalReject = reject;
      reject = (error) => {
        cleanup();
        originalReject(error);
      };
    });
  }
}

export default ApiService;
