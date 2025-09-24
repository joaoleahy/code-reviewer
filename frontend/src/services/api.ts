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
  ApiError
} from '../types/api';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message,
      status: error.response?.status,
      details: error.response?.data,
    };

    // Tratamento específico de erros
    if (error.response?.status === 429) {
      apiError.message = 'Rate limit excedido. Tente novamente mais tarde.';
    } else if (error.response?.status === 500) {
      apiError.message = 'Erro interno do servidor. Tente novamente.';
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Timeout na requisição. Verifique sua conexão.';
    }

    return Promise.reject(apiError);
  }
);

// Interceptador para logs (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((request) => {
    console.log('API Request:', request.method?.toUpperCase(), request.url);
    return request;
  });
}

export class ApiService {
  // ========== REVIEWS ==========
  
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

  // ========== STATISTICS ==========
  
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

  // ========== HEALTH ==========
  
  static async getHealth(): Promise<HealthCheck> {
    const response: AxiosResponse<HealthCheck> = await api.get('/health');
    return response.data;
  }

  static async getDetailedHealth(): Promise<any> {
    const response = await api.get('/health/detailed');
    return response.data;
  }

  // ========== UTILITIES ==========
  
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

  // Polling para status de review com melhor controle
  static async pollReviewStatus(
    reviewId: string,
    onUpdate: (review: Review) => void,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<Review> {
    let attempts = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    const start_time = Date.now(); // Tempo de início para timeout de segurança
    
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
          console.log(`[POLLING] Tentativa ${attempts}/${maxAttempts} para review ${reviewId}`);
          
          const review = await this.getReview(reviewId);
          onUpdate(review);
          
          // Condições de parada - review finalizada ou com erro
          if (review.status === 'completed' || review.status === 'failed') {
            console.log(`[POLLING] Finalizando polling - Status: ${review.status}`);
            cleanup();
            resolve(review);
            return;
          }
          
          // PATCH URGENTE: Se review tem error_message, considerar como failed
          if (review.error_message) {
            console.log(`[POLLING] Review com erro detectada, parando polling`);
            cleanup();
            resolve(review);
            return;
          }
          
          // Timeout - máximo de tentativas atingido
          if (attempts >= maxAttempts) {
            console.log(`[POLLING] Timeout - máximo de tentativas (${maxAttempts}) atingido`);
            cleanup();
            reject(new Error(`Timeout esperando conclusão da revisão após ${maxAttempts} tentativas`));
            return;
          }
          
          // Continuar polling apenas se ainda estiver pending ou in_progress
          if (review.status === 'pending' || review.status === 'in_progress') {
            // Adicionar timeout de segurança
            const elapsedTime = Date.now() - start_time;
            if (elapsedTime > 300000) { // 5 minutos máximo
              console.log(`[POLLING] Timeout de segurança (5min) atingido`);
              cleanup();
              reject(new Error('Timeout de segurança atingido'));
              return;
            }
            timeoutId = setTimeout(poll, intervalMs);
          } else {
            // Status desconhecido, parar polling
            console.log(`[POLLING] Status desconhecido (${review.status}), parando polling`);
            cleanup();
            resolve(review);
          }
        } catch (error) {
          console.error(`[POLLING] Erro na tentativa ${attempts}:`, error);
          cleanup();
          reject(error);
        }
      };
      
      // Iniciar primeiro poll
      poll();
      
      // Cleanup em caso de Promise ser rejeitada externamente
      const originalReject = reject;
      reject = (error) => {
        cleanup();
        originalReject(error);
      };
    });
  }
}

export default ApiService;
