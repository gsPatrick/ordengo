'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-48 bg-muted/40 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-muted/40 rounded-lg animate-pulse"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 glass rounded-2xl p-4 flex flex-col gap-3">
            <div className="h-4 w-24 bg-muted/40 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-muted/60 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-muted/30 rounded animate-pulse self-end mt-auto"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 glass rounded-3xl p-6 flex flex-col gap-4">
        <div className="h-6 w-1/4 bg-muted/40 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-muted/20 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
