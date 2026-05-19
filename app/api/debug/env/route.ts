import { NextResponse } from 'next/server';

// GET /api/debug/env - Check environment variables (for debugging only)
export async function GET() {
  const hasMongoUri = !!process.env.MONGODB_URI;
  const mongoUriLength = process.env.MONGODB_URI?.length || 0;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const hasCloudinaryName = !!process.env.CLOUDINARY_CLOUD_NAME;
  
  return NextResponse.json({
    environment: {
      MONGODB_URI: hasMongoUri ? `Set (${mongoUriLength} chars)` : 'NOT SET',
      JWT_SECRET: hasJwtSecret ? 'Set' : 'NOT SET',
      CLOUDINARY_CLOUD_NAME: hasCloudinaryName ? 'Set' : 'NOT SET',
    },
    nodeEnv: process.env.NODE_ENV,
  });
}
