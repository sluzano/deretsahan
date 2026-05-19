'use client';

import { useBookmarkStore } from '@/lib/store';
import { getVisitorId } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'default';
}

export function BookmarkButton({ postId, size = 'default' }: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();
  const bookmarked = isBookmarked(postId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const visitorId = getVisitorId();

    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks?visitorId=${visitorId}&postId=${postId}`, {
          method: 'DELETE',
        });
        removeBookmark(postId);
        toast.success('Removed from bookmarks');
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId, postId }),
        });
        addBookmark(postId);
        toast.success('Added to bookmarks');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'sm' : 'icon'}
      onClick={handleClick}
      className={`${
        size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
      } bg-background/80 backdrop-blur-sm hover:bg-background`}
    >
      {bookmarked ? (
        <BookmarkCheck className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-primary`} />
      ) : (
        <Bookmark className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
      )}
      <span className="sr-only">{bookmarked ? 'Remove bookmark' : 'Add bookmark'}</span>
    </Button>
  );
}
