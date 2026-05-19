import { cookies } from 'next/headers';
import { successResponse } from '@/lib/auth';

// POST /api/auth/logout - Logout user
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  
  return successResponse({ message: 'Logged out successfully' });
}
