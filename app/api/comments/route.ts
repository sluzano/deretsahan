import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Comment } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';

// GET /api/comments - Get all comments (admin) or approved comments for a post
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const admin = searchParams.get('admin') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (admin) {
      const user = await getCurrentUser(request);
      if (!user || !hasRole(user, ['admin', 'editor'])) {
        return errorResponse('Unauthorized', 401);
      }
    } else {
      query.isApproved = true;
    }

    if (postId) {
      query.post = postId;
    }

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('post', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query),
    ]);

    return successResponse({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return errorResponse('Failed to fetch comments', 500);
  }
}

// POST /api/comments - Create new comment (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await connectDB();

    const comment = await Comment.create({
      ...body,
      isApproved: false, // Comments need approval
    });

    return successResponse({ comment }, 201);
  } catch (error) {
    console.error('Create comment error:', error);
    return errorResponse('Failed to create comment', 500);
  }
}
