'use client';

import { useState } from 'react';
import { ListingFilter, SortBy } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlidersHorizontal, X } from 'lucide-react';

const SPECIES = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'];
const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'Newest', value: 'Newest' },
  { label: 'Price: Low to High', value: 'PriceLow' },
  { label: 'Price: High to Low', value: 'PriceHigh' },
  { label: 'Most Viewed', value: 'MostViewed' },
];

interface ListingFiltersProps {
  filters: ListingFilter;
  onFilterChange: (filters: Partial<ListingFilter>) => void;
}

export function ListingFilters({ filters, onFilterChange }: ListingFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleClear = () => {
    onFilterChange({
      species: undefined,
      breed: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      city: undefined,
      gender: undefined,
      isVaccinated: undefined,
      sortBy: undefined,
    });
  };

  const hasActiveFilters = !!(
    filters.species || filters.breed || filters.minPrice ||
    filters.maxPrice || filters.city || filters.gender || filters.isVaccinated
  );

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 space-y-4">
      {/* Species pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange({ species: undefined })}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !filters.species
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          All
        </button>
        {SPECIES.map((s) => (
          <button
            key={s}
            onClick={() => onFilterChange({ species: filters.species === s ? undefined : s })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filters.species === s
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sort + Advanced toggle row */}
      <div className="flex items-center gap-3">
        <select
          value={filters.sortBy ?? 'Newest'}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as SortBy })}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
            showAdvanced || hasActiveFilters
              ? 'border-rose-400 bg-rose-50 text-rose-600'
              : 'border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">!</span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 pt-2 border-t border-gray-100">
          <Input
            placeholder="City"
            value={filters.city ?? ''}
            onChange={(e) => onFilterChange({ city: e.target.value || undefined })}
          />
          <Input
            placeholder="Breed"
            value={filters.breed ?? ''}
            onChange={(e) => onFilterChange({ breed: e.target.value || undefined })}
          />
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice ?? ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice ?? ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />

          <div className="flex items-center gap-2 col-span-2 md:col-span-1">
            <select
              value={filters.gender ?? ''}
              onChange={(e) => onFilterChange({ gender: e.target.value || undefined })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="">Any Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.isVaccinated}
              onChange={(e) => onFilterChange({ isVaccinated: e.target.checked || undefined })}
              className="h-4 w-4 rounded accent-rose-500"
            />
            <span className="text-sm text-gray-700">Vaccinated only</span>
          </label>
        </div>
      )}
    </div>
  );
}
