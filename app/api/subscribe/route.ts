import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Subscriber } from '@/lib/models';
import { successResponse, errorResponse } from '@/lib/auth';

// POST /api/subscribe - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    await connectDB();

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return errorResponse('Email already subscribed', 400);
      }
      // Reactivate subscription
      existingSubscriber.isActive = true;
      await existingSubscriber.save();
      return successResponse({ message: 'Subscription reactivated' });
    }

    // Create new subscriber
    await Subscriber.create({ email });

    return successResponse({ message: 'Successfully subscribed' }, 201);
  } catch (error) {
    console.error('Subscribe error:', error);
    return errorResponse('Failed to subscribe', 500);
  }
}
