'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Post } from '@/types';
import { AlertCircle, X } from 'lucide-react';

interface BreakingNewsTickerProps {
  posts: Post[];
}

export function BreakingNewsTicker({ posts }: BreakingNewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (posts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [posts.length]);

  if (!posts.length || !isVisible) return null;

  return (
    <div className="bg-destructive text-destructive-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-10">
          <div className="flex items-center gap-2 pr-4 border-r border-destructive-foreground/20">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Breaking
            </span>
          </div>
          <div className="flex-1 overflow-hidden mx-4">
            <AnimatePresence mode="wait">
              <motion.a
                key={currentIndex}
                href={`/article/${posts[currentIndex].slug}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="block text-sm truncate hover:underline"
              >
                {posts[currentIndex].title}
              </motion.a>
            </AnimatePresence>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-destructive-foreground/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
