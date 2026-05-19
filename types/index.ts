// Type definitions for the News Portal

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  postCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: User;
  category: Category;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledAt?: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBreaking: boolean;
  views: number;
  readingTime: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: Post | string;
  name: string;
  email: string;
  content: string;
  isApproved: boolean;
  parentComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export interface Bookmark {
  _id: string;
  visitorId: string;
  post: Post;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

export interface StatsResponse {
  stats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalCategories: number;
    totalComments: number;
    pendingComments: number;
    totalSubscribers: number;
    totalViews: number;
  };
  recentPosts: Post[];
  topPosts: Post[];
  postsByCategory: Category[];
}
