import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in duration-300">
    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
    <p className="text-sm font-medium">{message || 'Loading...'}</p>
  </div>
);

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`h-4 bg-slate-200 rounded animate-pulse ${className}`} />
);

export const ContentSkeleton: React.FC = () => (
  <div className="space-y-6 max-w-3xl mx-auto p-8">
    <SkeletonLine className="w-3/4 h-8 mb-8" />
    <div className="space-y-2">
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-5/6" />
    </div>
    <div className="space-y-2 pt-4">
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-4/5" />
    </div>
  </div>
);
