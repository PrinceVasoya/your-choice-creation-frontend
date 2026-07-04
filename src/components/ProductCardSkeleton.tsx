import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col flex-shrink-0 select-none animate-pulse">
      {/* Aspect square thumbnail placeholder */}
      <div className="aspect-square bg-gray-200/60 w-full" />

      {/* Card info segment placeholder */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            {/* Category badge skeleton */}
            <div className="w-16 h-3 bg-gray-200 rounded-md" />
            {/* Star rating skeleton */}
            <div className="w-8 h-3 bg-gray-200 rounded-md" />
          </div>

          {/* Product name skeleton (2 lines) */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-3.5 bg-gray-200 rounded-md" />
            <div className="w-3/4 h-3.5 bg-gray-200 rounded-md" />
          </div>
        </div>

        {/* Divider and Price skeleton */}
        <div className="pt-2 border-t border-gray-50 flex items-baseline space-x-2">
          <div className="w-1/3 h-5 bg-gray-200 rounded-md" />
          <div className="w-1/4 h-4 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}
