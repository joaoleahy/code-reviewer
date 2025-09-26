import React from 'react';
import { Clock, Cog, CheckCircle, XCircle } from 'lucide-react';
import { ReviewStatus } from '../../types/api';
import { getStatusConfig, cn } from '../../utils/helpers';

interface StatusBadgeProps {
  status: ReviewStatus;
  showIcon?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  showText = true,
  size = 'md',
  className = ''
}) => {
  const config = getStatusConfig(status);
  
  const iconMap = {
    pending: Clock,
    in_progress: Cog,
    completed: CheckCircle,
    failed: XCircle
  };
  
  const Icon = iconMap[status];
  
  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      badge: 'px-2.5 py-0.5 text-xs',
      icon: 'h-4 w-4'
    },
    lg: {
      badge: 'px-3 py-1 text-sm',
      icon: 'h-4 w-4'
    }
  };

  const colorClasses = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        sizeClasses[size].badge,
        colorClasses[status],
        className
      )}
      title={config.description}
    >
      {showIcon && (
        <Icon 
          className={cn(
            sizeClasses[size].icon,
            showText && 'mr-1',
            status === 'in_progress' && 'animate-spin'
          )} 
        />
      )}
      {showText && config.label}
    </span>
  );
};

export const StatusProgress: React.FC<{
  currentStatus: ReviewStatus;
  className?: string;
}> = ({ currentStatus, className = '' }) => {
  const steps = [
    { status: 'pending' as ReviewStatus, label: 'Pending' },
    { status: 'in_progress' as ReviewStatus, label: 'In Progress' },
    { status: 'completed' as ReviewStatus, label: 'Completed' }
  ];

  const getCurrentStepIndex = () => {
    if (currentStatus === 'failed') return -1;
    return steps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (currentStatus === 'failed') {
    return (
      <div className={cn('flex items-center space-x-2 text-red-600', className)}>
        <XCircle className="h-5 w-5" />
        <span className="font-medium">Failed to process</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-4', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex || (currentStatus === 'completed' && step.status === 'completed');
        const isCurrent = index === currentStepIndex && currentStatus !== 'completed';
        const isPending = index > currentStepIndex;

        return (
          <div key={step.status} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                {
                  'bg-green-100 text-green-800': isCompleted,
                  'bg-blue-100 text-blue-800': isCurrent,
                  'bg-gray-100 text-gray-400': isPending
                }
              )}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : isCurrent ? (
                <Cog className="h-4 w-4 animate-spin" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            <span
              className={cn(
                'ml-2 text-sm font-medium',
                {
                  'text-green-600': isCompleted,
                  'text-blue-600': isCurrent,
                  'text-gray-400': isPending
                }
              )}
            >
              {step.label}
            </span>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'ml-4 h-0.5 w-8',
                  {
                    'bg-green-300': isCompleted,
                    'bg-gray-300': !isCompleted
                  }
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ProcessingTime: React.FC<{
  startTime: string;
  endTime?: string;
  processingTime?: number;
  className?: string;
}> = ({ startTime, endTime, processingTime, className = '' }) => {
  const formatTime = (time: number) => {
    if (time < 1) {
      return `${Math.round(time * 1000)}ms`;
    }
    return `${time.toFixed(2)}s`;
  };

  return (
    <div className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}>
      <Clock className="h-4 w-4" />
      {endTime && processingTime ? (
        <span>Processed in {formatTime(processingTime)}</span>
      ) : (
        <span>Processing...</span>
      )}
    </div>
  );
};

export default StatusBadge;
