import { NextRequest, NextResponse } from 'next/server';
import { webhookRetryService } from '@/services/webhook-retry.service';

/**
 * POST /api/v1/webhooks/retry
 * Retry failed webhooks (cron job endpoint)
 *
 * This should be called periodically (e.g., every 5 minutes) by a cron job
 * or cloud scheduler to retry failed webhook processing
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Retry failed webhooks
    const processedCount = await webhookRetryService.retryFailedWebhooks();

    // Get webhook statistics
    const stats = await webhookRetryService.getWebhookStats();

    return NextResponse.json({
      success: true,
      data: {
        processedCount,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Webhook retry cron error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Retry job failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/webhooks/retry
 * Get webhook statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Verify auth
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await webhookRetryService.getWebhookStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get webhook stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}
