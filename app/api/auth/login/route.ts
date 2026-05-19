import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { generateToken, successResponse, errorResponse } from '@/lib/auth';

// POST /api/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const db = await connectDB();
    if (!db) {
      return errorResponse('Database not connected. Please configure MONGODB_URI environment variable.', 500);
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Return user without password
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    return successResponse({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
}
