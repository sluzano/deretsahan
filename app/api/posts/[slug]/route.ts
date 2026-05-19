import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Post, Category } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/posts/[slug] - Get single post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    await connectDB();

    const post = await Post.findOne({ slug })
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color')
      .lean();

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Increment view count
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    return successResponse({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return errorResponse('Failed to fetch post', 500);
  }
}

// PUT /api/posts/[slug] - Update post (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin', 'editor', 'author'])) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    await connectDB();

    const post = await Post.findOne({ slug });
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Check if category changed
    const oldCategory = post.category;
    const newCategory = body.category;

    // Update post
    Object.assign(post, body);
    await post.save();

    // Update category post counts if category changed
    if (oldCategory.toString() !== newCategory) {
      await Category.findByIdAndUpdate(oldCategory, { $inc: { postCount: -1 } });
      await Category.findByIdAndUpdate(newCategory, { $inc: { postCount: 1 } });
    }

    await post.populate('author', 'name avatar');
    await post.populate('category', 'name slug color');

    return successResponse({ post });
  } catch (error) {
    console.error('Update post error:', error);
    return errorResponse('Failed to update post', 500);
  }
}

// DELETE /api/posts/[slug] - Delete post (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin', 'editor'])) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const post = await Post.findOneAndDelete({ slug });
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Update category post count
    await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });

    return successResponse({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return errorResponse('Failed to delete post', 500);
  }
}
