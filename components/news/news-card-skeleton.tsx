'use client';

import { motion } from 'framer-motion';

export function NewsCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'featured' | 'horizontal' | 'compact' }) {
  if (variant === 'featured') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-muted animate-pulse">
        <div className="aspect-[16/9]" />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 rounded-xl border border-border animate-pulse">
        <div className="w-32 h-24 md:w-48 md:h-32 bg-muted rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="w-20 h-5 bg-muted rounded-full" />
          <div className="h-5 bg-muted rounded w-full" />
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-3 py-3 border-b border-border animate-pulse">
        <div className="w-20 h-16 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card rounded-xl overflow-hidden border border-border animate-pulse"
    >
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted rounded w-full" />
        <div className="h-6 bg-muted rounded w-4/5" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-muted rounded-full" />
            <div className="w-20 h-4 bg-muted rounded" />
          </div>
          <div className="w-16 h-4 bg-muted rounded" />
        </div>
      </div>
    </motion.div>
  );
}
