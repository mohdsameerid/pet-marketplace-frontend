'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { favoritesApi } from '@/lib/api/favorites';
import { Favorite, PagedResult } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const [data, setData] = useState<PagedResult<Favorite> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await favoritesApi.getMyFavorites(pageNum);
      setData(res.data.data);
    } catch {
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleRemove = async (listingId: string) => {
    try {
      await favoritesApi.remove(listingId);
      toast.success('Removed from favorites');
      load(page);
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ProtectedRoute allowedRoles={['Buyer']}>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Heart size={22} className="text-rose-500" />
            <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            {data && <span className="text-sm text-gray-500">({data.totalCount})</span>}
          </div>

          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
              <Heart size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">No favorites yet</p>
              <p className="text-sm text-gray-400 mb-5">Browse listings and save the ones you like</p>
              <Link href="/listings"><Button>Browse Pets</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.items.map((fav) => (
                <div key={fav.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex gap-4 items-start">
                  <Link href={`/listings/${fav.listingId}`} className="shrink-0">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-rose-50">
                      {fav.mainImageUrl ? (
                        <Image src={fav.mainImageUrl} alt={fav.listingTitle} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🐾</div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${fav.listingId}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-rose-600 transition-colors truncate">
                        {fav.listingTitle}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-rose-500 mt-0.5">{formatPrice(fav.listingPrice)}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={11} />{fav.listingCity}</span>
                      <span>Saved {formatDate(fav.createdAt)}</span>
                      {fav.listingStatus !== 'Active' && (
                        <span className="text-orange-500 font-medium">({fav.listingStatus})</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(fav.listingId)}
                    className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          )}
        </main>
      </ProtectedRoute>
      <Footer />
    </div>
  );
}
