import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ReadingProgress } from '@/components/layout/reading-progress';
import { NewsCard } from '@/components/news/news-card';
import { ShareButtons } from '@/components/news/share-buttons';
import { BookmarkButton } from '@/components/news/bookmark-button';
import { CommentSection } from '@/components/news/comment-section';
import { formatDate } from '@/lib/helpers';
import connectDB from '@/lib/db';
import { Post, Comment } from '@/lib/models';
import type { Post as PostType, Comment as CommentType } from '@/types';
import { Clock, Eye, User, Calendar, Tag } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<PostType | null> {
  try {
    const db = await connectDB();
    if (!db) return null;
    const post = await Post.findOne({ slug, status: 'published' })
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color')
      .lean();

    if (post) {
      // Increment view count
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    }

    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

async function getRelatedPosts(post: PostType): Promise<PostType[]> {
  try {
    const db = await connectDB();
    if (!db) return [];
    const posts = await Post.find({
      _id: { $ne: post._id },
      status: 'published',
      $or: [{ category: post.category._id }, { tags: { $in: post.tags } }],
    })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to fetch related posts:', error);
    return [];
  }
}

async function getComments(postId: string): Promise<CommentType[]> {
  try {
    const db = await connectDB();
    if (!db) return [];
    const comments = await Comment.find({ post: postId, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(comments));
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Article Not Found' };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.featuredImage }],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const [relatedPosts, comments] = await Promise.all([
    getRelatedPosts(post),
    getComments(post._id),
  ]);

  const articleUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://newsportal.com/article/${post.slug}`;

  return (
    <>
      <ReadingProgress />
      <article className="min-h-screen">
        {/* Hero Section */}
        <header className="relative">
          <div className="absolute inset-0 h-[60vh] min-h-[400px]">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="relative container mx-auto px-4 pt-[30vh] pb-8">
            <div className="max-w-4xl mx-auto">
              {/* Category Badge */}
              <Link
                href={`/category/${post.category.slug}`}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-medium mb-4"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </Link>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{post.author.name}</p>
                    <p className="text-xs">Author</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} min read
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {post.views.toLocaleString()} views
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <ShareButtons url={articleUrl} title={post.title} />
                <BookmarkButton postId={post._id} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div
              className="article-content prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {post.author.bio && (
              <div className="mt-8 p-6 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{post.author.name}</h3>
                    <p className="text-muted-foreground mt-1">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Share at bottom */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Enjoyed this article? Share it with others.
              </p>
              <ShareButtons url={articleUrl} title={post.title} />
            </div>
          </div>
        </div>

        {/* Comments */}
        <section className="container mx-auto px-4 py-12 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <CommentSection postId={post._id} comments={comments} />
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto px-4 py-12 border-t border-border">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <NewsCard key={relatedPost._id} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
