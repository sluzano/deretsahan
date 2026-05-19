import { Metadata } from 'next';
import { NewsGrid } from '@/components/news/news-grid';
import connectDB from '@/lib/db';
import { Post } from '@/lib/models';
import type { Post as PostType } from '@/types';
import { Search as SearchIcon } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchPosts(query: string): Promise<{ posts: PostType[]; total: number }> {
  try {
    const db = await connectDB();
    if (!db) return { posts: [], total: 0 };

    const searchRegex = new RegExp(query, 'i');
    const filter = {
      status: 'published',
      $or: [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .sort({ publishedAt: -1 })
        .limit(12)
        .lean(),
      Post.countDocuments(filter),
    ]);

    return { posts: JSON.parse(JSON.stringify(posts)), total };
  } catch (error) {
    console.error('Failed to search posts:', error);
    return { posts: [], total: 0 };
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}"` : 'Search',
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q || '';
  const { posts, total } = query ? await searchPosts(query) : { posts: [], total: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SearchIcon className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Search</h1>
        </div>
        {query && (
          <p className="text-muted-foreground">
            {total} {total === 1 ? 'result' : 'results'} for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Search Form */}
      <form action="/search" method="GET" className="mb-8">
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          />
        </div>
      </form>

      {/* Results */}
      {query ? (
        posts.length > 0 ? (
          <NewsGrid
            initialPosts={posts}
            initialPagination={{
              page: 1,
              limit: 12,
              total,
              totalPages: Math.ceil(total / 12),
              hasMore: total > 12,
            }}
          />
        ) : (
          <div className="text-center py-16 bg-muted/50 rounded-xl">
            <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground">
              Try different keywords or check the spelling.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-xl">
          <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Start Searching</h2>
          <p className="text-muted-foreground">
            Enter keywords to search for articles.
          </p>
        </div>
      )}
    </div>
  );
}
