import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreakingNewsTicker } from '@/components/layout/breaking-news-ticker';
import connectDB from '@/lib/db';
import { Category, Post } from '@/lib/models';

async function getCategories() {
  try {
    const db = await connectDB();
    if (!db) return [];
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

async function getBreakingNews() {
  try {
    const db = await connectDB();
    if (!db) return [];
    const posts = await Post.find({ isBreaking: true, status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title slug')
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to fetch breaking news:', error);
    return [];
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, breakingNews] = await Promise.all([
    getCategories(),
    getBreakingNews(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <BreakingNewsTicker posts={breakingNews} />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
