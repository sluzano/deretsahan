'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/helpers';
import { BookmarkButton } from './bookmark-button';
import type { Post } from '@/types';
import { Clock, Eye } from 'lucide-react';

interface NewsCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'horizontal' | 'compact';
  priority?: boolean;
}

export function NewsCard({ post, variant = 'default', priority = false }: NewsCardProps) {
  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-2xl bg-card"
      >
        <Link href={`/article/${post.slug}`} className="block">
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-3 py-1 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: post.category.color }}
                >
                  {post.category.name}
                </span>
                {post.isTrending && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500 text-white">
                    Trending
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-2 text-balance">
                {post.title}
              </h2>
              <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{post.author.name}</p>
                    <p className="text-xs text-white/60">
                      {formatRelativeTime(post.publishedAt || post.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/60 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
        <div className="absolute top-4 right-4">
          <BookmarkButton postId={post._id} />
        </div>
      </motion.article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="group flex gap-4 bg-card rounded-xl overflow-hidden border border-border p-4"
      >
        <Link href={`/article/${post.slug}`} className="flex-shrink-0">
          <div className="relative w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </span>
            </div>
            <Link href={`/article/${post.slug}`}>
              <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
            </Link>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(post.publishedAt || post.createdAt)}
            </span>
            <BookmarkButton postId={post._id} size="sm" />
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="group flex gap-3 py-3 border-b border-border last:border-0"
      >
        <Link href={`/article/${post.slug}`} className="flex-shrink-0">
          <div className="relative w-20 h-16 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/article/${post.slug}`}>
            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(post.publishedAt || post.createdAt)}
          </p>
        </div>
      </motion.article>
    );
  }

  // Default card
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card rounded-xl overflow-hidden border border-border"
    >
      <Link href={`/article/${post.slug}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span
              className="px-3 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.name}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <BookmarkButton postId={post._id} />
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/article/${post.slug}`}>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors text-balance">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {post.author.name.charAt(0)}
            </div>
            <span className="text-sm text-muted-foreground">{post.author.name}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime} min
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
