'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SpeciesCardProps {
  name: string;
  emoji: string;
  value: string;
  bgColor: string;
  imagePath: string;
}

export function SpeciesCard({ name, emoji, value, bgColor, imagePath }: SpeciesCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/listings?species=${value}`}
      className="group flex flex-col items-center gap-3 transition-transform duration-200 hover:-translate-y-1"
    >
      {/* Circle */}
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full overflow-hidden shadow-md ring-4 ring-white group-hover:ring-rose-200 group-hover:shadow-lg transition-all duration-200 ${bgColor}`}
      >
        {!imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imagePath}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-5xl select-none">{emoji}</span>
        )}
      </div>

      {/* Label */}
      <span className="text-sm font-bold text-gray-700 group-hover:text-rose-500 transition-colors">
        {name}
      </span>
    </Link>
  );
}
