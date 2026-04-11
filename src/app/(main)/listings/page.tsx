'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingGrid } from '@/components/features/listings/ListingGrid';
import { ListingFilters } from '@/components/features/listings/ListingFilters';
import { Pagination } from '@/components/ui/Pagination';
import { useListings } from '@/hooks/useListings';

function ListingsContent() {
  const searchParams = useSearchParams();

  // Read initial filters from URL query params (e.g. ?species=Dog from Discover section)
  const initialFilters = {
    species: searchParams.get('species') ?? undefined,
    breed: searchParams.get('breed') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') as 'Newest' | 'PriceLow' | 'PriceHigh' | 'MostViewed') ?? undefined,
  };

  const { data, isLoading, error, filters, updateFilters, goToPage } = useListings(initialFilters);

  useEffect(() => { document.title = 'Browse Pets — PetMarketplace'; }, []);

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Pets</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">{data.totalCount} listings found</p>
          )}
        </div>
      </div>

      <ListingFilters filters={filters} onFilterChange={updateFilters} />

      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-center text-red-600">
          {error}
        </div>
      ) : (
        <ListingGrid
          listings={data?.items ?? []}
          isLoading={isLoading}
        />
      )}

      {data && data.totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={data.pageNumber}
            totalPages={data.totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </main>
  );
}

export default function ListingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1" />}>
        <ListingsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
