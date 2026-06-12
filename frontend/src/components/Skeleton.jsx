import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm p-4 animate-pulse">
      {/* Image shimmer */}
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
      
      {/* Category shimmer */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4 mb-2"></div>
      
      {/* Title shimmer */}
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-3"></div>
      
      {/* Rating & Stock shimmer */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
      </div>
      
      {/* Bottom section (Price + Button) */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-10"></div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Large Image shimmer */}
        <div className="w-full h-96 sm:h-[450px] bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
        
        {/* Details shimmer */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl w-full"></div>
          
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          
          <div className="flex items-center space-x-4 pt-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl w-32"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-grow"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4 w-full animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl w-full flex items-center justify-between px-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-16"></div>
        </div>
      ))}
    </div>
  );
}
