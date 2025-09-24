import { ProgrammingLanguage } from '../types/api';

// Programming language settings
export const LANGUAGE_CONFIG = {
  [ProgrammingLanguage.PYTHON]: {
    label: 'Python',
    extension: '.py',
    highlightLanguage: 'python',
    color: '#3776ab',
    icon: '🐍'
  },
  [ProgrammingLanguage.JAVASCRIPT]: {
    label: 'JavaScript',
    extension: '.js',
    highlightLanguage: 'javascript',
    color: '#f7df1e',
    icon: '🟨'
  },
  [ProgrammingLanguage.TYPESCRIPT]: {
    label: 'TypeScript',
    extension: '.ts',
    highlightLanguage: 'typescript',
    color: '#3178c6',
    icon: '🔷'
  },
  [ProgrammingLanguage.JAVA]: {
    label: 'Java',
    extension: '.java',
    highlightLanguage: 'java',
    color: '#ed8b00',
    icon: '☕'
  },
  [ProgrammingLanguage.CPP]: {
    label: 'C++',
    extension: '.cpp',
    highlightLanguage: 'cpp',
    color: '#00599c',
    icon: '⚡'
  },
  [ProgrammingLanguage.CSHARP]: {
    label: 'C#',
    extension: '.cs',
    highlightLanguage: 'csharp',
    color: '#239120',
    icon: '#️⃣'
  },
  [ProgrammingLanguage.GO]: {
    label: 'Go',
    extension: '.go',
    highlightLanguage: 'go',
    color: '#00add8',
    icon: '🐹'
  },
  [ProgrammingLanguage.RUST]: {
    label: 'Rust',
    extension: '.rs',
    highlightLanguage: 'rust',
    color: '#000000',
    icon: '🦀'
  },
  [ProgrammingLanguage.PHP]: {
    label: 'PHP',
    extension: '.php',
    highlightLanguage: 'php',
    color: '#777bb4',
    icon: '🐘'
  },
  [ProgrammingLanguage.RUBY]: {
    label: 'Ruby',
    extension: '.rb',
    highlightLanguage: 'ruby',
    color: '#cc342d',
    icon: '💎'
  },
  [ProgrammingLanguage.OTHER]: {
    label: 'Others',
    extension: '.txt',
    highlightLanguage: 'text',
    color: '#6b7280',
    icon: '📝'
  }
};

// Review status
export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'yellow',
    icon: '⏳',
    description: 'Waiting for processing'
  },
  in_progress: {
    label: 'In Progress',
    color: 'blue',
    icon: '⚙️',
    description: 'Being reviewed by AI'
  },
  completed: {
    label: 'Completed',
    color: 'green',
    icon: '✅',
    description: 'Review completed'
  },
  failed: {
    label: 'Failed',
    color: 'red',
    icon: '❌',
    description: 'Processing error'
  }
};

// Quality levels
export const QUALITY_LEVELS = {
  1: { label: 'Very Poor', color: 'red-600', emoji: '😵' },
  2: { label: 'Poor', color: 'red-500', emoji: '😞' },
  3: { label: 'Weak', color: 'orange-500', emoji: '😕' },
  4: { label: 'Below Average', color: 'orange-400', emoji: '🙁' },
  5: { label: 'Average', color: 'yellow-500', emoji: '😐' },
  6: { label: 'Above Average', color: 'yellow-400', emoji: '🙂' },
  7: { label: 'Good', color: 'green-400', emoji: '😊' },
  8: { label: 'Very Good', color: 'green-500', emoji: '😄' },
  9: { label: 'Excellent', color: 'green-600', emoji: '🤩' },
  10: { label: 'Perfect', color: 'green-700', emoji: '🏆' }
};

// Application settings
export const APP_CONFIG = {
  name: 'AI Code Reviewer',
  version: '1.0.0',
  description: 'AI-powered code review system',
  maxCodeLength: 10000,
  maxDescriptionLength: 500,
  pollingInterval: 2000,
  pollingMaxAttempts: 30,
  pagination: {
    defaultPerPage: 10,
    maxPerPage: 50,
    pageSizes: [5, 10, 20, 50]
  }
};

// URLs e links
export const LINKS = {
  github: 'https://github.com',
  docs: '/docs',
  api: '/api/docs',
  support: 'mailto:support@codecreviewer.com'
};

// System messages
export const MESSAGES = {
  success: {
    codeSubmitted: 'Code submitted successfully!',
    dataExported: 'Data exported successfully!',
    reviewDeleted: 'Review deleted successfully!'
  },
  error: {
    generic: 'Something went wrong. Please try again.',
    network: 'Connection error. Check your internet.',
    timeout: 'Request timeout. Please try again.',
    rateLimitExceeded: 'Rate limit exceeded.',
    fileNotFound: 'File not found.',
    invalidData: 'Invalid data provided.'
  },
  info: {
    noReviews: 'No reviews found.',
    processing: 'Processing your request...',
    loading: 'Loading...',
    polling: 'Waiting for review completion...'
  }
};

// Regex patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  code: /^[\s\S]*$/
};

// Chart color themes
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // yellow-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
  '#6b7280'  // gray-500
];

// Export settings
export const EXPORT_CONFIG = {
  csv: {
    delimiter: ',',
    encoding: 'utf-8',
    includeHeaders: true
  },
  filename: {
    reviews: (startDate: string, endDate: string) => `reviews_${startDate}_${endDate}.csv`,
    stats: () => `statistics_${new Date().toISOString().split('T')[0]}.csv`
  }
};
