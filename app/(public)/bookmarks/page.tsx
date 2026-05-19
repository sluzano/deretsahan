'use client';

import { useEffect, useState } from 'react';
import { NewsCard } from '@/components/news/news-card';
import { NewsCardSkeleton } from '@/components/news/news-card-skeleton';
import { getVisitorId } from '@/lib/helpers';
import { useBookmarkStore } from '@/lib/store';
import type { Post } from '@/types';
import { Bookmark, BookmarkX } from 'lucide-react';

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setBookmarks } = useBookmarkStore();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const visitorId = getVisitorId();
      if (!visitorId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookmarks?visitorId=${visitorId}`);
        const data = await res.json();

        if (data.success) {
          const bookmarkedPosts = data.data.bookmarks
            .map((b: { post: Post }) => b.post)
            .filter(Boolean);
          setPosts(bookmarkedPosts);
          setBookmarks(bookmarkedPosts.map((p: Post) => p._id));
        }
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [setBookmarks]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Bookmarks</h1>
        </div>
        <p className="text-muted-foreground">
          Your saved articles for later reading.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <NewsCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-xl">
          <BookmarkX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
          <p className="text-muted-foreground">
            Start saving articles to read later by clicking the bookmark icon.
          </p>
        </div>
      )}
    </div>
  );
}
