import { NextRequest } from 'next/server';
import { getCurrentUser, successResponse, errorResponse, hasRole } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

// POST /api/upload - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user || !hasRole(user, ['admin', 'editor', 'author'])) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Allowed: JPEG, PNG, WebP, GIF', 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File too large. Maximum size is 5MB', 400);
    }

    const result = await uploadImage(file);

    return successResponse({ 
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Failed to upload image', 500);
  }
}
