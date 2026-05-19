import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Post, Category, Comment, Subscriber } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin', 'editor', 'author'])) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    // Get counts
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalComments,
      pendingComments,
      totalSubscribers,
      totalViews,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Category.countDocuments({ isActive: true }),
      Comment.countDocuments(),
      Comment.countDocuments({ isApproved: false }),
      Subscriber.countDocuments({ isActive: true }),
      Post.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]).then((res) => res[0]?.total || 0),
    ]);

    // Get recent posts
    const recentPosts = await Post.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status views createdAt')
      .lean();

    // Get top posts by views
    const topPosts = await Post.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views slug')
      .lean();

    // Get posts by category
    const postsByCategory = await Category.find({ isActive: true })
      .select('name postCount color')
      .sort({ postCount: -1 })
      .lean();

    return successResponse({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalCategories,
        totalComments,
        pendingComments,
        totalSubscribers,
        totalViews,
      },
      recentPosts,
      topPosts,
      postsByCategory,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse('Failed to fetch statistics', 500);
  }
}
