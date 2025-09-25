import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Zap, 
  ThumbsUp, 
  Star,
  Copy,
  Share2
} from 'lucide-react';
import { Review } from '../../types/api';
import { getQualityLevel, formatDate, formatSeconds } from '../../utils/helpers';
import CodeHighlight from '../UI/CodeHighlight';
import StatusBadge from '../UI/StatusBadge';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ReviewResultProps {
  review: Review | null;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

const ReviewResult: React.FC<ReviewResultProps> = ({
  review,
  isLoading = false,
  error,
  onRetry,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <LoadingSpinner 
          size="lg" 
          text="Analyzing your code... This may take a few seconds." 
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Review Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No review selected</p>
        </div>
      </div>
    );
  }

  const { feedback } = review;
  
  if (!feedback) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <StatusBadge status={review.status} size="lg" className="mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {review.status === 'failed' ? 'Review Failed' : 'Processing Review'}
          </h3>
          <p className="text-gray-600">
            {review.status === 'failed' 
              ? review.error_message || 'Unknown error during processing'
              : 'Your review is being processed...'
            }
          </p>
        </div>
      </div>
    );
  }

  const qualityLevel = getQualityLevel(feedback.quality_score);

  const handleCopyResult = async () => {
    const resultText = `
# Code Review - ${review.language}

## Quality Score: ${feedback.quality_score}/10 (${qualityLevel.label})

${feedback.issues.length > 0 ? `## Identified Issues
${feedback.issues.map(issue => `• ${issue}`).join('\n')}` : ''}

${feedback.suggestions.length > 0 ? `## Improvement Suggestions
${feedback.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}` : ''}

${feedback.security_concerns.length > 0 ? `## Security Concerns
${feedback.security_concerns.map(concern => `• ${concern}`).join('\n')}` : ''}

${feedback.performance_recommendations.length > 0 ? `## Performance Recommendations
${feedback.performance_recommendations.map(rec => `• ${rec}`).join('\n')}` : ''}

${feedback.positive_aspects.length > 0 ? `## Positive Aspects
${feedback.positive_aspects.map(aspect => `• ${aspect}`).join('\n')}` : ''}

---
Review generated on ${formatDate(review.created_at)}
    `.trim();

    try {
      await navigator.clipboard.writeText(resultText);
    } catch (error) {
      console.error('Error copying result:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className={`p-3 rounded-lg bg-${qualityLevel.color} bg-opacity-10`}
              style={{ backgroundColor: `${qualityLevel.color}20` }}
            >
              <Star className={`h-6 w-6 text-${qualityLevel.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Complete Review
              </h2>
              <p className="text-sm text-gray-600">
                {formatDate(review.created_at)} • {review.language}
                {review.processing_time && ` • Processed in ${formatSeconds(review.processing_time)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={handleCopyResult}
              title="Copy result"
            />
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              title="Share"
            />
            <StatusBadge status={review.status} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className={`text-3xl font-bold text-${qualityLevel.color}`}>
              {feedback.quality_score}
              <span className="text-lg text-gray-400">/10</span>
            </div>
            <div className="text-sm text-gray-600">Quality</div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{qualityLevel.emoji}</span>
            <span className={`font-medium text-${qualityLevel.color}`}>
              {qualityLevel.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analyzed Code</h3>
        {review.description && (
          <p className="text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg italic">
            "{review.description}"
          </p>
        )}
        <CodeHighlight
          code={review.code}
          language={review.language}
          maxHeight="300px"
        />
      </div>

      <div className="p-6 space-y-6">
        {feedback.issues.length > 0 && (
          <FeedbackSection
            title="Identified Issues"
            items={feedback.issues}
            icon={AlertTriangle}
            iconColor="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-200"
          />
        )}

        {feedback.suggestions.length > 0 && (
          <FeedbackSection
            title="Improvement Suggestions"
            items={feedback.suggestions}
            icon={CheckCircle}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
        )}

        {feedback.security_concerns.length > 0 && (
          <FeedbackSection
            title="Security Concerns"
            items={feedback.security_concerns}
            icon={Shield}
            iconColor="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-200"
            priority="high"
          />
        )}

        {feedback.performance_recommendations.length > 0 && (
          <FeedbackSection
            title="Performance Recommendations"
            items={feedback.performance_recommendations}
            icon={Zap}
            iconColor="text-yellow-600"
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
          />
        )}

        {feedback.positive_aspects.length > 0 && (
          <FeedbackSection
            title="Positive Aspects"
            items={feedback.positive_aspects}
            icon={ThumbsUp}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-200"
          />
        )}
      </div>
    </div>
  );
};

const FeedbackSection: React.FC<{
  title: string;
  items: string[];
  icon: any;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  priority?: 'high' | 'medium' | 'low';
}> = ({ title, items, icon: Icon, iconColor, bgColor, borderColor, priority }) => (
  <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
    <div className="flex items-center space-x-2 mb-3">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <h4 className="font-medium text-gray-900">{title}</h4>
      {priority === 'high' && (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
          High Priority
        </span>
      )}
    </div>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start space-x-2 text-sm">
          <span className={`block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${iconColor.replace('text-', 'bg-')}`} />
          <span className="text-gray-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ReviewResult;
