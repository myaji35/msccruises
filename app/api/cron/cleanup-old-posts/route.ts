import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldPosts } from '@/services/sns-scheduler.service';

/**
 * Cron endpoint for cleaning up old SNS posts
 *
 * Usage:
 * - Call this endpoint daily/weekly from a cron service
 * - Removes old posted/failed posts to keep database clean
 */
export async function POST(request: NextRequest) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV !== 'production';

    // Skip auth check in development
    if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get retention days from query param or use default (90 days)
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');
    const retentionDays = days ? parseInt(days) : 90;

    console.log(`[Cleanup] Removing posts older than ${retentionDays} days...`);

    const result = await cleanupOldPosts(retentionDays);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      retentionDays,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cleanup] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Use POST method' },
      { status: 405 }
    );
  }

  return POST(request);
}
