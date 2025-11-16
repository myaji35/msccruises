import { NextRequest, NextResponse } from 'next/server';
import { webhookRetryService } from '@/services/webhook-retry.service';

/**
 * POST /api/v1/payments/stripe/webhook
 * Handle Stripe webhook events with retry logic
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { success: false, error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Log webhook for retry processing
    const webhookId = await webhookRetryService.logWebhook({
      provider: 'stripe',
      eventType: event.type,
      eventId: event.id,
      payload: event,
    });

    // Process webhook asynchronously with retry logic
    webhookRetryService.processWebhook(webhookId).catch((error) => {
      console.error('Webhook processing error:', error);
    });

    // Return 200 immediately to acknowledge receipt
    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
