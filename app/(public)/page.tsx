import Link from 'next/link';
import { NewsCard } from '@/components/news/news-card';
import { NewsGrid } from '@/components/news/news-grid';
import { Button } from '@/components/ui/button';
import connectDB from '@/lib/db';
import { Post, Category } from '@/lib/models';
import type { Post as PostType, Category as CategoryType } from '@/types';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

async function getFeaturedPosts(): Promise<PostType[]> {
  try {
    const db = await connectDB();
    if (!db) return [];
    const posts = await Post.find({ isFeatured: true, status: 'published' })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to fetch featured posts:', error);
    return [];
  }
}

async function getTrendingPosts(): Promise<PostType[]> {
  try {
    const db = await connectDB();
    if (!db) return [];
    const posts = await Post.find({ isTrending: true, status: 'published' })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .sort({ views: -1 })
      .limit(5)
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to fetch trending posts:', error);
    return [];
  }
}

async function getLatestPosts(): Promise<{ posts: PostType[]; total: number }> {
  try {
    const db = await connectDB();
    if (!db) return { posts: [], total: 0 };
    const [posts, total] = await Promise.all([
      Post.find({ status: 'published' })
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .sort({ publishedAt: -1 })
        .limit(9)
        .lean(),
      Post.countDocuments({ status: 'published' }),
    ]);
    return { posts: JSON.parse(JSON.stringify(posts)), total };
  } catch (error) {
    console.error('Failed to fetch latest posts:', error);
    return { posts: [], total: 0 };
  }
}

async function getCategories(): Promise<CategoryType[]> {
  try {
    const db = await connectDB();
    if (!db) return [];
    const categories = await Category.find({ isActive: true })
      .sort({ postCount: -1 })
      .limit(8)
      .lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

async function getPopularPosts(): Promise<PostType[]> {
  try {
    const db = await connectDB();
    if (!db) return [];
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .sort({ views: -1 })
      .limit(5)
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to fetch popular posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const [featuredPosts, trendingPosts, { posts: latestPosts, total }, categories, popularPosts] =
    await Promise.all([
      getFeaturedPosts(),
      getTrendingPosts(),
      getLatestPosts(),
      getCategories(),
      getPopularPosts(),
    ]);

  const mainFeatured = featuredPosts[0];
  const sideFeatured = featuredPosts.slice(1, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        {mainFeatured ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Featured */}
            <div className="lg:col-span-2">
              <NewsCard post={mainFeatured} variant="featured" priority />
            </div>

            {/* Side Featured */}
            <div className="space-y-4">
              {sideFeatured.map((post) => (
                <NewsCard key={post._id} post={post} variant="horizontal" />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/50 rounded-2xl">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Welcome to NewsPortal</h2>
            <p className="text-muted-foreground mb-6">
              Get started by seeding the database and creating your first articles.
            </p>
            <Link href="/admin">
              <Button>Go to Admin Dashboard</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Explore:
              </span>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.postCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trendingPosts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Trending Now</h2>
                <p className="text-sm text-muted-foreground">Most popular stories</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {trendingPosts.map((post, index) => (
              <div key={post._id} className="relative">
                <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center justify-center z-10">
                  {index + 1}
                </span>
                <NewsCard post={post} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest News */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Latest News</h2>
              <Link href="/latest">
                <Button variant="ghost" className="group">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            {latestPosts.length > 0 ? (
              <NewsGrid
                initialPosts={latestPosts}
                initialPagination={{
                  page: 1,
                  limit: 9,
                  total,
                  totalPages: Math.ceil(total / 9),
                  hasMore: total > 9,
                }}
              />
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground">No articles published yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Popular Posts Widget */}
            {popularPosts.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Popular Posts
                </h3>
                <div className="space-y-1">
                  {popularPosts.map((post) => (
                    <NewsCard key={post._id} post={post} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Widget */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest news delivered to your inbox daily.
              </p>
              <form
                action="/api/subscribe"
                method="POST"
                className="space-y-3"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" className="w-full">
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Categories Widget */}
            {categories.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/category/${category.slug}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {category.postCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
