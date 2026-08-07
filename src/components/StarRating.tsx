'use client';

import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0.5 to 5.0
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const fullValue = i;
    const halfValue = i - 0.5;

    const isFull = activeRating >= fullValue;
    const isHalf = activeRating >= halfValue && activeRating < fullValue;

    stars.push(
      <div
        key={i}
        className={`relative inline-flex items-center ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {/* Underlay Base Empty Star */}
        <Star className={`${iconSizes[size]} text-slate-700 fill-slate-800/40`} />

        {/* Foreground Star Fill (Full or Half) */}
        {isFull ? (
          <Star className={`${iconSizes[size]} text-amber-400 fill-amber-400 absolute top-0 left-0`} />
        ) : isHalf ? (
          <StarHalf className={`${iconSizes[size]} text-amber-400 fill-amber-400 absolute top-0 left-0`} />
        ) : null}

        {/* Interactive Hitboxes (Left half = i - 0.5, Right half = i) */}
        {interactive && (
          <div className="absolute inset-0 flex z-10">
            <div
              className="w-1/2 h-full"
              onMouseEnter={() => setHoverRating(halfValue)}
              onClick={() => onChange && onChange(halfValue)}
              title={`${halfValue} Stars`}
            />
            <div
              className="w-1/2 h-full"
              onMouseEnter={() => setHoverRating(fullValue)}
              onClick={() => onChange && onChange(fullValue)}
              title={`${fullValue} Stars`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="ml-1 text-xs font-bold text-amber-300">
        {activeRating > 0 ? activeRating.toFixed(1) : 'NR'}
      </span>
    </div>
  );
}
