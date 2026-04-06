'use client';

import { useState, useEffect, useCallback } from 'react';
import { listingsApi } from '@/lib/api/listings';
import { Listing, ListingFilter, PagedResult } from '@/types';

export function useListings(initialFilters: ListingFilter = {}) {
  const [data, setData] = useState<PagedResult<Listing> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingFilter>({
    pageNumber: 1,
    pageSize: 12,
    ...initialFilters,
  });

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listingsApi.getAll(filters);
      setData(response.data.data);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateFilters = (newFilters: Partial<ListingFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, pageNumber: 1 }));
  };

  const goToPage = (pageNumber: number) => {
    setFilters((prev) => ({ ...prev, pageNumber }));
  };

  return { data, isLoading, error, filters, updateFilters, goToPage, refetch: fetchListings };
}
