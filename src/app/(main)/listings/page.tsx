'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingGrid } from '@/components/features/listings/ListingGrid';
import { ListingFilters } from '@/components/features/listings/ListingFilters';
import { Pagination } from '@/components/ui/Pagination';
import { useListings } from '@/hooks/useListings';

export default function ListingsPage() {
  const { data, isLoading, error, filters, updateFilters, goToPage } = useListings();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
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
      <Footer />
    </div>
  );
}
