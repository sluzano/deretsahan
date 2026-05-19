import { seedDatabase } from '@/lib/seed-data';
import { successResponse, errorResponse } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';

// POST /api/seed - Seed initial data with sample posts
export async function POST() {
  try {
    const db = await connectDB();
    if (!db) {
      return errorResponse('Database not connected. Please configure MONGODB_URI.', 500);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return errorResponse('Database already seeded', 400);
    }

    const result = await seedDatabase();

    return successResponse({
      message: result.message,
      admin: result.admin,
    }, 201);
  } catch (error) {
    console.error('Seed error:', error);
    return errorResponse('Failed to seed database', 500);
  }
}
