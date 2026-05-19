import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();

    const category = await Category.findById(id).lean();

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return successResponse({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return errorResponse('Failed to fetch category', 500);
  }
}

// PUT /api/categories/[id] - Update category (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin'])) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    await connectDB();

    const category = await Category.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return successResponse({ category });
  } catch (error) {
    console.error('Update category error:', error);
    return errorResponse('Failed to update category', 500);
  }
}

// DELETE /api/categories/[id] - Delete category (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin'])) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return successResponse({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse('Failed to delete category', 500);
  }
}
