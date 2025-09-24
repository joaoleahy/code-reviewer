// Tipos para integração com a API

export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum ProgrammingLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  JAVA = 'java',
  CPP = 'cpp',
  CSHARP = 'csharp',
  GO = 'go',
  RUST = 'rust',
  PHP = 'php',
  RUBY = 'ruby',
  OTHER = 'other'
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface CodeSubmission {
  code: string;
  language: ProgrammingLanguage;
  description?: string;
}

export interface ReviewFeedback {
  quality_score: number;
  issues: string[];
  suggestions: string[];
  security_concerns: string[];
  performance_recommendations: string[];
  positive_aspects: string[];
}

export interface Review {
  id: string;
  code: string;
  language: ProgrammingLanguage;
  description?: string;
  status: ReviewStatus;
  feedback?: ReviewFeedback;
  created_at: string;
  completed_at?: string;
  ip_address?: string;
  processing_time?: number;
  error_message?: string;
}

export interface ReviewResponse {
  id: string;
  status: ReviewStatus;
  message: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface LanguageStats {
  language: string;
  count: number;
  average_score: number;
}

export interface DailyStats {
  date: string;
  count: number;
  average_score: number;
}

export interface CommonIssue {
  issue: string;
  count: number;
}

export interface StatsResponse {
  total_reviews: number;
  total_completed: number;
  total_failed: number;
  average_quality_score: number;
  average_processing_time: number;
  language_stats: LanguageStats[];
  daily_stats: DailyStats[];
  common_issues: CommonIssue[];
  score_distribution: Record<string, number>;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
  services: {
    mongodb: string;
    openai_configured: string;
  };
  environment: string;
}

// Tipos para filtros e paginação
export interface ReviewFilters {
  page?: number;
  per_page?: number;
  language?: string;
  status?: ReviewStatus;
  start_date?: string;
  end_date?: string;
  search_text?: string;
}

export interface ExportFilters {
  start_date: string;
  end_date: string;
  languages?: string[];
  min_score?: number;
  max_score?: number;
}

// Tipos para UI
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}
