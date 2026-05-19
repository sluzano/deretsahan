import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { NewsGrid } from '@/components/news/news-grid';
import connectDB from '@/lib/db';
import { Post, Category } from '@/lib/models';
import type { Post as PostType, Category as CategoryType } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<CategoryType | null> {
  try {
    const db = await connectDB();
    if (!db) return null;
    const category = await Category.findOne({ slug, isActive: true }).lean();
    return category ? JSON.parse(JSON.stringify(category)) : null;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

async function getCategoryPosts(
  categoryId: string
): Promise<{ posts: PostType[]; total: number }> {
  try {
    const db = await connectDB();
    if (!db) return { posts: [], total: 0 };
    const [posts, total] = await Promise.all([
      Post.find({ category: categoryId, status: 'published' })
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .sort({ publishedAt: -1 })
        .limit(12)
        .lean(),
      Post.countDocuments({ category: categoryId, status: 'published' }),
    ]);
    return { posts: JSON.parse(JSON.stringify(posts)), total };
  } catch (error) {
    console.error('Failed to fetch category posts:', error);
    return { posts: [], total: 0 };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${category.name} News`,
    description: category.description || `Latest ${category.name} news and updates`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const { posts, total } = await getCategoryPosts(category._id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {total} {total === 1 ? 'article' : 'articles'}
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <NewsGrid
          initialPosts={posts}
          initialPagination={{
            page: 1,
            limit: 12,
            total,
            totalPages: Math.ceil(total / 12),
            hasMore: total > 12,
          }}
          category={slug}
        />
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-xl">
          <p className="text-muted-foreground">
            No articles in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
