import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '../services/api';
import { Review, ReviewListResponse, StatsResponse, ReviewFilters } from '../types/api';

export const useLoading = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  return { isLoading, setIsLoading, error, setError, clearError };
};

export const useReview = (reviewId?: string) => {
  const [review, setReview] = useState<Review | null>(null);
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);
  const { isLoading, setIsLoading, error, setError, clearError } = useLoading(false);

  const fetchReview = useCallback(async (id: string) => {
    if (isLoading && lastFetchedId === id) {
      console.log(`[useReview] Already loading review ${id}, ignoring new request`);
      return;
    }

    setLastFetchedId(id);
    setIsLoading(true);
    clearError();
    
    try {
      console.log(`[useReview] Loading review ${id}`);
      const reviewData = await ApiService.getReview(id);
      setReview(reviewData);
      console.log(`[useReview] Review loaded successfully:`, reviewData.status);
    } catch (err: any) {
      console.error(`[useReview] Error loading review ${id}:`, err);
      setError(err.message || 'Error loading review');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastFetchedId, clearError, setError, setIsLoading]);

  useEffect(() => {
    if (reviewId && reviewId !== lastFetchedId) {
      fetchReview(reviewId);
    }
  }, [reviewId, fetchReview, lastFetchedId]);

  const refresh = useCallback(() => {
    if (reviewId) {
      fetchReview(reviewId);
    }
  }, [reviewId, fetchReview]);

  return { review, isLoading, error, refresh, setReview };
};

export const useReviews = (initialFilters: ReviewFilters = {}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 0
  });
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters);
  const { isLoading, setIsLoading, error, setError, clearError } = useLoading(false);
  const [lastFetchedFilters, setLastFetchedFilters] = useState<string>('');

  const fetchReviews = useCallback(async (currentFilters: ReviewFilters) => {
    const filtersKey = JSON.stringify(currentFilters);
    
    if (isLoading && lastFetchedFilters === filtersKey) {
      console.log('[useReviews] Already loading with same filters, ignoring request');
      return;
    }

    setLastFetchedFilters(filtersKey);
    setIsLoading(true);
    clearError();
    
    try {
      console.log('[useReviews] Fetching reviews with filters:', currentFilters);
      const response: ReviewListResponse = await ApiService.listReviews(currentFilters);
      setReviews(response.reviews);
      setPagination({
        total: response.total,
        page: response.page,
        per_page: response.per_page,
        total_pages: response.total_pages
      });
      console.log(`[useReviews] Loaded ${response.reviews.length} reviews`);
    } catch (err: any) {
      console.error('[useReviews] Error loading reviews:', err);
      setError(err.message || 'Error loading reviews');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastFetchedFilters, clearError, setError, setIsLoading]);

  useEffect(() => {
    const filtersKey = JSON.stringify(filters);
    if (filtersKey !== lastFetchedFilters) {
      fetchReviews(filters);
    }
  }, [filters, fetchReviews, lastFetchedFilters]);

  const updateFilters = useCallback((newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const changePage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    setLastFetchedFilters('');
    fetchReviews(filters);
  }, [fetchReviews, filters]);

  return {
    reviews,
    pagination,
    filters,
    updateFilters,
    changePage,
    isLoading,
    error,
    refresh
  };
};

export const useStats = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { isLoading, setIsLoading, error, setError, clearError } = useLoading(false);

  const fetchStats = useCallback(async () => {
    if (isLoading) {
      console.log('[useStats] Already loading, ignoring request');
      return;
    }

    setIsLoading(true);
    clearError();
    
    try {
      console.log('[useStats] Fetching statistics');
      const statsData = await ApiService.getStatistics();
      setStats(statsData);
      setHasInitialized(true);
      console.log('[useStats] Statistics loaded successfully');
    } catch (err: any) {
      console.error('[useStats] Error loading statistics:', err);
      setError(err.message || 'Error loading statistics');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, clearError, setError, setIsLoading]);

  useEffect(() => {
    if (!hasInitialized && !isLoading) {
      fetchStats();
    }
  }, [hasInitialized, isLoading, fetchStats]);

  const refresh = useCallback(() => {
    setHasInitialized(false);
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh };
};

export const useReviewPolling = () => {
  const [pollingReview, setPollingReview] = useState<Review | null>(null);
  const [currentPollingId, setCurrentPollingId] = useState<string | null>(null);
  const { isLoading, setIsLoading, error, setError, clearError } = useLoading(false);
  const pollingPromiseRef = useRef<Promise<Review> | null>(null);

  const startPolling = useCallback(async (reviewId: string) => {
    if (currentPollingId === reviewId && isLoading) {
      console.log(`[POLLING] Active polling already exists for review ${reviewId}`);
      return;
    }

    if (isLoading && currentPollingId !== reviewId) {
      console.log(`[POLLING] Polling already active for review ${currentPollingId}, ignoring new request`);
      return;
    }

    setCurrentPollingId(reviewId);
    setIsLoading(true);
    clearError();
    
    try {
      console.log(`[POLLING] Starting polling for review ${reviewId}`);
      
      const pollingPromise = ApiService.pollReviewStatus(
        reviewId,
        (updatedReview) => {
          console.log(`[POLLING] Update received:`, updatedReview.status);
          setPollingReview(updatedReview);
        },
        20,
        3000
      );
      
      pollingPromiseRef.current = pollingPromise;
      const finalReview = await pollingPromise;
      
      console.log(`[POLLING] Polling completed successfully:`, finalReview.status);
      setPollingReview(finalReview);
      
    } catch (err: any) {
      console.error(`[POLLING] Polling error:`, err);
      setError(err.message || 'Review polling error');
    } finally {
      setIsLoading(false);
      setCurrentPollingId(null);
      pollingPromiseRef.current = null;
    }
  }, [isLoading, currentPollingId, clearError, setError, setIsLoading]);

  const reset = useCallback(() => {
    console.log(`[POLLING] Reset called`);
    setPollingReview(null);
    setCurrentPollingId(null);
    clearError();
    pollingPromiseRef.current = null;
  }, [clearError]);

  useEffect(() => {
    return () => {
      console.log(`[POLLING] Cleanup on component unmount`);
      pollingPromiseRef.current = null;
    };
  }, []);

  return {
    pollingReview,
    startPolling,
    isPolling: isLoading,
    pollingError: error,
    currentPollingId,
    reset
  };
};

export const useCodeSubmission = () => {
  const { isLoading, setIsLoading, error, setError, clearError } = useLoading(false);

  const submitCode = useCallback(async (submission: any) => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await ApiService.submitReview(submission);
      return response;
    } catch (err: any) {
      setError(err.message || 'Error submitting code');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setError, setIsLoading]);

  return {
    submitCode,
    isSubmitting: isLoading,
    submitError: error,
    clearSubmitError: clearError
  };
};

export const useExport = () => {
  const { isLoading, setIsLoading, error, setError, clearError } = useLoading(false);

  const exportReviews = useCallback(async (filters: any, filename: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      const blob = await ApiService.exportReviewsCSV(filters);
      await ApiService.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.message || 'Error exporting data');
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setError, setIsLoading]);

  const exportStats = useCallback(async (filename: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      const blob = await ApiService.exportStatsCSV();
      await ApiService.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.message || 'Error exporting statistics');
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setError, setIsLoading]);

  return {
    exportReviews,
    exportStats,
    isExporting: isLoading,
    exportError: error,
    clearExportError: clearError
  };
};
