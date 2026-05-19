import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { getCurrentUser, successResponse, errorResponse } from '@/lib/auth';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    return successResponse({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Failed to get user', 500);
  }
}

// PUT /api/auth/me - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    const { name, bio, avatar } = await request.json();

    await connectDB();
    const user = await User.findByIdAndUpdate(
      currentUser._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    return successResponse({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('Failed to update user', 500);
  }
}
