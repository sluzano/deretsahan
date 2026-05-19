import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return successResponse({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin'])) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    await connectDB();

    const category = await Category.create(body);

    return successResponse({ category }, 201);
  } catch (error) {
    console.error('Create category error:', error);
    return errorResponse('Failed to create category', 500);
  }
}
