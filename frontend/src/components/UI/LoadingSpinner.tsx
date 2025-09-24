import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={cn('flex items-center justify-center', fullScreen && 'min-h-screen')}>
      <div className={cn('flex flex-col items-center space-y-3', className)}>
        <Loader2 className={cn('animate-spin text-primary-600', sizeClasses[size])} />
        {text && (
          <p className={cn('text-gray-600 font-medium', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Componente de skeleton para loading states
export const SkeletonLine: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = 'w-full',
  height = 'h-4',
  className = ''
}) => (
  <div className={cn('animate-pulse bg-gray-200 rounded', width, height, className)} />
);

// Skeleton para cards
export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => (
  <div className={cn('p-6 bg-white rounded-lg border border-gray-200 animate-pulse', className)}>
    <div className="space-y-3">
      <SkeletonLine height="h-6" width="w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} height="h-4" />
      ))}
    </div>
  </div>
);

// Loading overlay para botões
export const ButtonLoading: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
);

export default LoadingSpinner;
