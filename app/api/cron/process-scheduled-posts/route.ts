import { NextRequest, NextResponse } from 'next/server';
import { processScheduledPosts } from '@/services/sns-scheduler.service';

/**
 * Cron endpoint for processing scheduled SNS posts
 *
 * Usage:
 * - Call this endpoint every minute (or desired interval) from a cron service
 * - Example with curl: curl -X POST http://localhost:3000/api/cron/process-scheduled-posts -H "Authorization: Bearer YOUR_CRON_SECRET"
 * - With Vercel Cron: Add to vercel.json
 * - With GitHub Actions: Setup workflow to call this endpoint
 *
 * Security:
 * - Protect this endpoint with a secret token in production
 * - Set CRON_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Security check - validate cron secret in production
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV !== 'production';

    // Skip auth check in development
    if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting scheduled posts processing...');

    // Process all scheduled posts
    const stats = await processScheduledPosts();

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      stats,
    };

    console.log('[Cron] Completed:', response);

    return NextResponse.json(response);
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error('[Cron] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing
 * In production, you might want to disable this or protect it
 */
export async function GET(request: NextRequest) {
  // For development/testing only
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Use POST method' },
      { status: 405 }
    );
  }

  return POST(request);
}
