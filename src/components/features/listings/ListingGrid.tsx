import { Listing } from '@/types';
import { ListingCard } from './ListingCard';
import { Spinner } from '@/components/ui/Spinner';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  favoritedIds?: Set<string>;
  onFavoriteChange?: (listingId: string, isFav: boolean) => void;
}

export function ListingGrid({ listings, isLoading, favoritedIds, onFavoriteChange }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
        <span className="text-5xl">🐾</span>
        <p className="text-gray-500">No listings found</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isFavorited={favoritedIds?.has(listing.id)}
          onFavoriteChange={onFavoriteChange}
        />
      ))}
    </div>
  );
}
