import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Comment } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/comments/[id] - Update comment (admin only - for approval)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin', 'editor'])) {
      return errorResponse('Unauthorized', 401);
    }

    const { isApproved } = await request.json();

    await connectDB();

    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!comment) {
      return errorResponse('Comment not found', 404);
    }

    return successResponse({ comment });
  } catch (error) {
    console.error('Update comment error:', error);
    return errorResponse('Failed to update comment', 500);
  }
}

// DELETE /api/comments/[id] - Delete comment (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin', 'editor'])) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return errorResponse('Comment not found', 404);
    }

    return successResponse({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return errorResponse('Failed to delete comment', 500);
  }
}
