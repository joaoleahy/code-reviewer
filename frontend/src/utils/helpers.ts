import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QUALITY_LEVELS, STATUS_CONFIG, LANGUAGE_CONFIG } from './constants';
import { ReviewStatus, ProgrammingLanguage } from '../types/api';


export const formatDate = (date: string | Date, pattern: string = 'dd/MM/yyyy HH:mm') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: ptBR });
};

export const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
};

export const formatDateForInput = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};


export const formatNumber = (num: number, decimals: number = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatPercentage = (num: number, decimals: number = 1) => {
  return `${formatNumber(num, decimals)}%`;
};

export const formatSeconds = (seconds: number) => {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`;
  }
  return `${formatNumber(seconds, 2)}s`;
};


export const getStatusConfig = (status: ReviewStatus) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
};

export const getStatusBadgeClass = (status: ReviewStatus) => {
  const config = getStatusConfig(status);
  return `status-${status} text-${config.color}-800 bg-${config.color}-100`;
};


export const getLanguageConfig = (language: ProgrammingLanguage | string) => {
  return LANGUAGE_CONFIG[language as ProgrammingLanguage] || LANGUAGE_CONFIG.other;
};

export const getLanguageLabel = (language: ProgrammingLanguage | string) => {
  return getLanguageConfig(language).label;
};


export const getQualityLevel = (score: number) => {
  const clampedScore = Math.max(1, Math.min(10, Math.round(score)));
  return QUALITY_LEVELS[clampedScore as keyof typeof QUALITY_LEVELS];
};

export const getQualityColor = (score: number) => {
  return getQualityLevel(score).color;
};

export const getQualityEmoji = (score: number) => {
  return getQualityLevel(score).emoji;
};


export const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};


export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidCode = (code: string, maxLength: number = 10000) => {
  return code.trim().length > 0 && code.length <= maxLength;
};


export const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((groups, item) => {
    const group = (item[key] as unknown) as string;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[], key?: keyof T) => {
  if (!key) {
    return Array.from(new Set(array));
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};


export const cn = (...classes: (string | undefined | null | false | Record<string, boolean>)[]) => {
  return classes
    .map((cls) => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, condition]) => condition)
          .map(([className]) => className)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
};

export const getColorClass = (color: string, type: 'text' | 'bg' | 'border' = 'text') => {
  return `${type}-${color}`;
};


export const calculateSuccessRate = (completed: number, total: number) => {
  if (total === 0) return 0;
  return (completed / total) * 100;
};

export const calculateAverage = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const getScoreDistributionPercentages = (distribution: Record<string, number>) => {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  if (total === 0) return distribution;
  
  return Object.entries(distribution).reduce((acc, [score, count]) => {
    acc[score] = (count / total) * 100;
    return acc;
  }, {} as Record<string, number>);
};


export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  return 'Unknown error';
};

export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error') ||
         error?.message?.includes('fetch');
};


export const setLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Error removing from localStorage:', error);
  }
};


export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
