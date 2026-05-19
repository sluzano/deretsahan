'use client';

import { useState } from 'react';
import { NewsCard } from './news-card';
import { NewsCardSkeleton } from './news-card-skeleton';
import { Button } from '@/components/ui/button';
import type { Post, Pagination } from '@/types';
import { Loader2 } from 'lucide-react';

interface NewsGridProps {
  initialPosts: Post[];
  initialPagination: Pagination;
  category?: string;
  showLoadMore?: boolean;
}

export function NewsGrid({
  initialPosts,
  initialPagination,
  category,
  showLoadMore = true,
}: NewsGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (isLoading || !pagination.hasMore) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page + 1),
        limit: String(pagination.limit),
      });
      if (category) params.set('category', category);

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();

      if (data.success) {
        setPosts((prev) => [...prev, ...data.data.posts]);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!posts.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No articles found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <NewsCard key={post._id} post={post} priority={index < 3} />
        ))}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <NewsCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {showLoadMore && pagination.hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Articles'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
