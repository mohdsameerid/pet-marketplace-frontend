'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Listing } from '@/types';
import { formatPrice, formatAge } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { favoritesApi } from '@/lib/api/favorites';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface ListingCardProps {
  listing: Listing;
  isFavorited?: boolean;
  onFavoriteChange?: (listingId: string, isFav: boolean) => void;
}

const speciesEmoji: Record<string, string> = {
  Dog: '🐶',
  Cat: '🐱',
  Bird: '🐦',
  Fish: '🐠',
  Rabbit: '🐰',
  Other: '🐾',
};

export function ListingCard({ listing, isFavorited = false, onFavoriteChange }: ListingCardProps) {
  const { isAuthenticated } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const mainImage = listing.images.find((img) => img.isMain) ?? listing.images[0];

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      return;
    }
    setFavLoading(true);
    try {
      if (favorited) {
        await favoritesApi.remove(listing.id);
        setFavorited(false);
        onFavoriteChange?.(listing.id, false);
        toast.success('Removed from favorites');
      } else {
        await favoritesApi.add(listing.id);
        setFavorited(true);
        onFavoriteChange?.(listing.id, true);
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="group relative rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-rose-50">
          {mainImage ? (
            <Image
              src={mainImage.imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              {speciesEmoji[listing.species] ?? '🐾'}
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart
              size={18}
              className={favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-400'}
            />
          </button>

          {/* Species badge */}
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm">
              {speciesEmoji[listing.species]} {listing.species}
            </span>
          </div>

          {/* Negotiable tag */}
          {listing.isNegotiable && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-green-500/90 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white">
                Negotiable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
              {listing.title}
            </h3>
            <span className="shrink-0 text-lg font-bold text-rose-500">
              {formatPrice(listing.price)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            {listing.breed && <span>{listing.breed}</span>}
            {listing.breed && <span>·</span>}
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatAge(listing.ageMonths)}
            </span>
            <span>·</span>
            <span>{listing.gender}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              {listing.city}
            </span>

            {listing.isSellerVerified && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <ShieldCheck size={12} />
                Verified
              </span>
            )}
          </div>

          {/* Health tags */}
          {(listing.isVaccinated || listing.isVetChecked || listing.isNeutered) && (
            <div className="mt-3 flex flex-wrap gap-1">
              {listing.isVaccinated && (
                <Badge variant="success" className="text-[10px]">Vaccinated</Badge>
              )}
              {listing.isVetChecked && (
                <Badge variant="info" className="text-[10px]">Vet Checked</Badge>
              )}
              {listing.isNeutered && (
                <Badge variant="default" className="text-[10px]">Neutered</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
