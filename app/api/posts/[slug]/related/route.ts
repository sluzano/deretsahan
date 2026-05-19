import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Post } from '@/lib/models';
import { successResponse, errorResponse } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/posts/[slug]/related - Get related posts
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    await connectDB();

    // Get current post
    const currentPost = await Post.findOne({ slug });
    if (!currentPost) {
      return errorResponse('Post not found', 404);
    }

    // Find related posts by same category or matching tags
    const relatedPosts = await Post.find({
      _id: { $ne: currentPost._id },
      status: 'published',
      $or: [
        { category: currentPost.category },
        { tags: { $in: currentPost.tags } },
      ],
    })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    return successResponse({ posts: relatedPosts });
  } catch (error) {
    console.error('Get related posts error:', error);
    return errorResponse('Failed to fetch related posts', 500);
  }
}
