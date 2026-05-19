import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Post, Category } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';

// GET /api/posts - Get all posts (public) or all posts for admin
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const admin = searchParams.get('admin') === 'true';

    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // For public requests, only show published posts
    if (!admin) {
      query.status = 'published';
    } else {
      // For admin requests, check authentication
      const user = await getCurrentUser(request);
      if (!user || !hasRole(user, ['admin', 'editor', 'author'])) {
        return errorResponse('Unauthorized', 401);
      }
      if (status) query.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Trending filter
    if (trending === 'true') {
      query.isTrending = true;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return errorResponse('Failed to fetch posts', 500);
  }
}

// POST /api/posts - Create new post (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin', 'editor', 'author'])) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    await connectDB();

    // Create post
    const post = await Post.create({
      ...body,
      author: user._id,
    });

    // Update category post count
    await Category.findByIdAndUpdate(body.category, { $inc: { postCount: 1 } });

    // Populate author and category
    await post.populate('author', 'name avatar');
    await post.populate('category', 'name slug color');

    return successResponse({ post }, 201);
  } catch (error) {
    console.error('Create post error:', error);
    return errorResponse('Failed to create post', 500);
  }
}
