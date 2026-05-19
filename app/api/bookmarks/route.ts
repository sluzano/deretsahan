import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Bookmark, Post } from '@/lib/models';
import { successResponse, errorResponse } from '@/lib/auth';

// GET /api/bookmarks - Get bookmarks for a visitor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
      return errorResponse('Visitor ID is required', 400);
    }

    await connectDB();

    const bookmarks = await Bookmark.find({ visitorId })
      .populate({
        path: 'post',
        select: 'title slug excerpt featuredImage publishedAt category',
        populate: { path: 'category', select: 'name slug color' },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out any bookmarks where the post was deleted
    const validBookmarks = bookmarks.filter((b) => b.post);

    return successResponse({ bookmarks: validBookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return errorResponse('Failed to fetch bookmarks', 500);
  }
}

// POST /api/bookmarks - Add bookmark
export async function POST(request: NextRequest) {
  try {
    const { visitorId, postId } = await request.json();

    if (!visitorId || !postId) {
      return errorResponse('Visitor ID and Post ID are required', 400);
    }

    await connectDB();

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ visitorId, post: postId });
    if (existingBookmark) {
      return errorResponse('Already bookmarked', 400);
    }

    const bookmark = await Bookmark.create({ visitorId, post: postId });

    return successResponse({ bookmark }, 201);
  } catch (error) {
    console.error('Add bookmark error:', error);
    return errorResponse('Failed to add bookmark', 500);
  }
}

// DELETE /api/bookmarks - Remove bookmark
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');
    const postId = searchParams.get('postId');

    if (!visitorId || !postId) {
      return errorResponse('Visitor ID and Post ID are required', 400);
    }

    await connectDB();

    const bookmark = await Bookmark.findOneAndDelete({ visitorId, post: postId });

    if (!bookmark) {
      return errorResponse('Bookmark not found', 404);
    }

    return successResponse({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    return errorResponse('Failed to remove bookmark', 500);
  }
}
