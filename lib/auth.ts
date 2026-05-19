import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import connectDB from './db';
import { User, IUser } from './models';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate JWT token
export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Get current user from request (for API routes)
export async function getCurrentUser(request: NextRequest): Promise<IUser | null> {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }
    
    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    return user;
  } catch {
    return null;
  }
}

// Get current user from cookies (for server components)
export async function getCurrentUserFromCookies(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }
    
    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    return user;
  } catch {
    return null;
  }
}

// Check if user has required role
export function hasRole(user: IUser | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// API response helpers
export function successResponse(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
