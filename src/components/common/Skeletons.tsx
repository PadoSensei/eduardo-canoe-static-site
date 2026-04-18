import React from "react";

export const TourCardSkeleton = () => (
  <div
    data-testid="skeleton-tour-card"
    className="flex flex-col items-center gap-6 p-5 border-b last:border-b-0 animate-pulse sm:flex-row"
  >
    <div className="w-full h-40 bg-gray-200 sm:w-48 sm:h-32 rounded-2xl shrink-0" />
    <div className="flex-grow space-y-3">
      <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto sm:mx-0" />
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-md w-16" />
      </div>
    </div>
    <div className="flex flex-row items-center justify-between w-full gap-6 sm:flex-col sm:w-auto sm:items-end sm:justify-center">
      <div className="space-y-1">
        <div className="h-3 bg-gray-100 rounded w-8 ml-auto" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-12 bg-gray-200 rounded-2xl w-32" />
    </div>
  </div>
);

export const PassengerRowSkeleton = () => (
  <div
    data-testid="skeleton-passenger-row"
    className="p-4 mb-3 border border-gray-100 rounded-xl flex items-center justify-between animate-pulse bg-white"
  >
    <div className="space-y-3 flex-1">
      <div className="flex items-center gap-2">
        <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-3 mt-2">
        <div className="h-8 bg-gray-100 rounded-lg w-16" />
        <div className="h-8 bg-gray-100 rounded-lg w-24" />
      </div>
    </div>
    <div className="w-12 h-12 bg-gray-100 rounded-full" />
  </div>
);

export const DayManifestTourCardSkeleton = () => (
  <div
    data-testid="skeleton-manifest-tour-card"
    className="p-5 bg-white border border-gray-100 rounded-xl animate-pulse"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-6 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-8 bg-gray-200 rounded-lg w-12" />
    </div>
    <div className="h-10 bg-gray-100 rounded-lg w-full" />
  </div>
);
