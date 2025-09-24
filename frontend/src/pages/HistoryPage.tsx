import React, { useState } from 'react';
import { Search, Filter, Calendar, Download, Eye, Trash2, X } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import { useReviews, useExport } from '../hooks/useApi';
import { ReviewFilters, ProgrammingLanguage, ReviewStatus } from '../types/api';
import { 
  formatDate, 
  formatRelativeTime, 
  getLanguageConfig, 
  getQualityLevel,
  truncateText 
} from '../utils/helpers';
import { LANGUAGE_CONFIG } from '../utils/constants';

const HistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  
  const {
    reviews,
    pagination,
    filters,
    updateFilters,
    changePage,
    isLoading,
    error,
    refresh
  } = useReviews();

  const { exportReviews, isExporting } = useExport();

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const { ApiService } = await import('../services/api');
      await ApiService.deleteReview(reviewId);
      refresh();
    } catch (error: any) {
      alert(`Error deleting review: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      search_text: searchTerm.trim() || undefined,
      page: 1
    });
  };

  const handleExport = async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Últimos 3 meses

    const filename = `reviews_history_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`;
    
    await exportReviews({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      ...(filters.language && { languages: [filters.language] })
    }, filename);
  };

  const clearFilters = () => {
    updateFilters({
      language: undefined,
      status: undefined,
      start_date: undefined,
      end_date: undefined,
      search_text: undefined,
      page: 1
    });
    setSearchTerm('');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Review History
            </h1>
            <p className="text-lg text-gray-600">
              View and manage all completed code reviews
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              icon={Filter}
              className={showFilters ? 'bg-gray-50' : ''}
            >
              Filters
            </Button>
            
            <Button
              onClick={handleExport}
              loading={isExporting}
              icon={Download}
              variant="outline"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Barra de busca */}
          <form onSubmit={handleSearch} className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <Button type="submit" icon={Search}>
              Search
            </Button>
          </form>

          {/* Expandable filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Filtro por linguagem */}
              <div>
                <label className="form-label">Language</label>
                <select
                  value={filters.language || ''}
                  onChange={(e) => updateFilters({ language: e.target.value || undefined })}
                  className="form-input"
                >
                  <option value="">All</option>
                  {Object.entries(LANGUAGE_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por status */}
              <div>
                <label className="form-label">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ status: e.target.value as ReviewStatus || undefined })}
                  className="form-input"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Filtro por data */}
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => updateFilters({ start_date: e.target.value || undefined })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => updateFilters({ end_date: e.target.value || undefined })}
                  className="form-input"
                />
              </div>

              {/* Clear filters button */}
              <div className="md:col-span-4 flex justify-end pt-2">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Review list */}
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading history
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              Try Again
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-600 mb-4">
              No reviews match the applied filters
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onView={() => setSelectedReview(review.id)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))}
          </div>
        )}

        {/* Paginação */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} reviews
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }).map((_, i) => {
                  const page = i + Math.max(1, pagination.page - 2);
                  if (page > pagination.total_pages) return null;
                  
                  return (
                    <Button
                      key={page}
                      onClick={() => changePage(page)}
                      variant={page === pagination.page ? 'primary' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Details modal */}
        {selectedReview && (
          <ReviewDetailsModal
            reviewId={selectedReview}
            onClose={() => setSelectedReview(null)}
          />
        )}
      </div>
    </Layout>
  );
};

// Review details modal component
const ReviewDetailsModal: React.FC<{
  reviewId: string;
  onClose: () => void;
}> = ({ reviewId, onClose }) => {
  const [review, setReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadReview = async () => {
      try {
        const { ApiService } = await import('../services/api');
        const reviewData = await ApiService.getReview(reviewId);
        setReview(reviewData);
      } catch (error) {
        console.error('Error loading review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReview();
  }, [reviewId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-center">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-center">Error loading review</p>
          <Button onClick={onClose} className="mt-4 mx-auto">Close</Button>
        </div>
      </div>
    );
  }

  const languageConfig = getLanguageConfig(review.language);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: languageConfig.color }}
            >
              {languageConfig.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Review - {languageConfig.label}
              </h2>
              <p className="text-sm text-gray-500">ID: {review.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status e informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <StatusBadge status={review.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Created on</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(review.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Processing</label>
              <p className="mt-1 text-sm text-gray-900">
                {review.processing_time ? `${review.processing_time.toFixed(2)}s` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Code</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {review.code}
              </pre>
            </div>
          </div>

          {/* Description */}
          {review.description && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {review.description}
              </p>
            </div>
          )}

          {/* Feedback */}
          {review.feedback && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">AI Feedback</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {review.feedback.quality_score}/10
                  </div>
                  <div className="text-sm text-blue-700">Quality Score</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {review.feedback.issues.length}
                  </div>
                  <div className="text-sm text-red-700">Issues</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {review.feedback.suggestions.length}
                  </div>
                  <div className="text-sm text-yellow-700">Suggestions</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {review.feedback.positive_aspects.length}
                  </div>
                  <div className="text-sm text-green-700">Positives</div>
                </div>
              </div>

              {/* Issues */}
              {review.feedback.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Identified Issues</h4>
                  <ul className="space-y-1">
                    {review.feedback.issues.map((issue: string, index: number) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sugestões */}
              {review.feedback.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Suggestions</h4>
                  <ul className="space-y-1">
                    {review.feedback.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aspectos positivos */}
              {review.feedback.positive_aspects.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Positive Aspects</h4>
                  <ul className="space-y-1">
                    {review.feedback.positive_aspects.map((aspect: string, index: number) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {aspect}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Segurança */}
              {review.feedback.security_concerns.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Security Concerns</h4>
                  <ul className="space-y-1">
                    {review.feedback.security_concerns.map((concern: string, index: number) => (
                      <li key={index} className="text-sm text-orange-700 flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Performance */}
              {review.feedback.performance_recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Performance Recommendations</h4>
                  <ul className="space-y-1">
                    {review.feedback.performance_recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-purple-700 flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error message if any */}
          {review.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Processing Error</h4>
              <p className="text-sm text-red-700">{review.error_message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Individual review card component
const ReviewCard: React.FC<{
  review: any;
  onView: () => void;
  onDelete: () => void;
}> = ({ review, onView, onDelete }) => {
  const languageConfig = getLanguageConfig(review.language);
  const qualityLevel = review.feedback ? getQualityLevel(review.feedback.quality_score) : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Language icon */}
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: languageConfig.color }}
          >
            {languageConfig.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {languageConfig.label}
              </h3>
              <StatusBadge status={review.status} size="sm" />
              {qualityLevel && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-600">
                    {review.feedback.quality_score}/10
                  </span>
                  <span>{qualityLevel.emoji}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {truncateText(review.code, 150)}
            </p>
            
            {review.description && (
              <p className="text-sm text-gray-500 italic mb-2">
                "{truncateText(review.description, 100)}"
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(review.created_at)}</span>
              </span>
              <span>ID: {review.id.substring(0, 8)}...</span>
              {review.processing_time && (
                <span>{review.processing_time.toFixed(2)}s</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            onClick={onView}
            variant="outline"
            size="sm"
            icon={Eye}
            title="View details"
          />
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            icon={Trash2}
            title="Deletar"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      </div>

      {/* Feedback preview */}
      {review.feedback && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-red-600 font-medium">
                {review.feedback.issues.length}
              </div>
              <div className="text-gray-500">Issues</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 font-medium">
                {review.feedback.suggestions.length}
              </div>
              <div className="text-gray-500">Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-orange-600 font-medium">
                {review.feedback.security_concerns.length}
              </div>
              <div className="text-gray-500">Security</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-medium">
                {review.feedback.positive_aspects.length}
              </div>
              <div className="text-gray-500">Positives</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
