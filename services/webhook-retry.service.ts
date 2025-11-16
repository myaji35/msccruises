/**
 * Webhook Retry Service
 *
 * Handles webhook logging and automatic retry with exponential backoff
 */

import { PrismaClient } from '@prisma/client';
import { paymentService } from './payment.service';

const prisma = new PrismaClient();

interface WebhookEvent {
  provider: 'stripe' | 'tosspay';
  eventType: string;
  eventId: string;
  payload: any;
}

class WebhookRetryService {
  /**
   * Log incoming webhook
   */
  async logWebhook(event: WebhookEvent): Promise<string> {
    try {
      const result: any = await prisma.$queryRaw`
        INSERT INTO WebhookLog (
          id,
          provider,
          eventType,
          eventId,
          payload,
          status,
          attemptCount,
          createdAt,
          updatedAt
        ) VALUES (
          ${this.generateId()},
          ${event.provider},
          ${event.eventType},
          ${event.eventId},
          ${JSON.stringify(event.payload)},
          'pending',
          0,
          datetime('now'),
          datetime('now')
        )
        ON CONFLICT(provider, eventId) DO UPDATE SET
          updatedAt = datetime('now')
        RETURNING id
      `;

      const webhookId = result[0]?.id || result.id;
      return webhookId;
    } catch (error: any) {
      console.error('Log webhook error:', error);
      throw error;
    }
  }

  /**
   * Process webhook with retry logic
   */
  async processWebhook(webhookId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get webhook details
      const webhook: any = await prisma.$queryRaw`
        SELECT * FROM WebhookLog
        WHERE id = ${webhookId}
        LIMIT 1
      `;

      if (!webhook || webhook.length === 0) {
        return { success: false, error: 'Webhook not found' };
      }

      const webhookData = webhook[0];

      // Check if max attempts reached
      if (webhookData.attemptCount >= webhookData.maxAttempts) {
        await prisma.$executeRaw`
          UPDATE WebhookLog
          SET status = 'failed',
              lastError = 'Max retry attempts reached',
              updatedAt = datetime('now')
          WHERE id = ${webhookId}
        `;
        return { success: false, error: 'Max retry attempts reached' };
      }

      // Update status to processing
      await prisma.$executeRaw`
        UPDATE WebhookLog
        SET status = 'processing',
            attemptCount = attemptCount + 1,
            lastAttemptAt = datetime('now'),
            updatedAt = datetime('now')
        WHERE id = ${webhookId}
      `;

      // Parse payload
      const payload = JSON.parse(webhookData.payload);

      // Process based on provider
      let result;
      if (webhookData.provider === 'stripe') {
        result = await this.processStripeWebhook(payload);
      } else if (webhookData.provider === 'tosspay') {
        result = await this.processTossPayWebhook(payload);
      } else {
        throw new Error(`Unknown provider: ${webhookData.provider}`);
      }

      if (result.success) {
        // Mark as success
        await prisma.$executeRaw`
          UPDATE WebhookLog
          SET status = 'success',
              processedAt = datetime('now'),
              lastError = NULL,
              updatedAt = datetime('now')
          WHERE id = ${webhookId}
        `;
        return { success: true };
      } else {
        // Mark as pending for retry
        await prisma.$executeRaw`
          UPDATE WebhookLog
          SET status = 'pending',
              lastError = ${result.error || 'Processing failed'},
              updatedAt = datetime('now')
          WHERE id = ${webhookId}
        `;

        // Schedule retry with exponential backoff
        const delayMs = this.calculateRetryDelay(webhookData.attemptCount + 1);
        setTimeout(() => {
          this.processWebhook(webhookId);
        }, delayMs);

        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Process webhook error:', error);

      // Log error
      await prisma.$executeRaw`
        UPDATE WebhookLog
        SET status = 'pending',
            lastError = ${error.message || 'Processing error'},
            updatedAt = datetime('now')
        WHERE id = ${webhookId}
      `;

      return { success: false, error: error.message };
    }
  }

  /**
   * Process Stripe webhook event
   */
  private async processStripeWebhook(payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      const eventType = payload.type;
      const paymentIntent = payload.data?.object;

      if (!paymentIntent) {
        return { success: false, error: 'Missing payment intent data' };
      }

      // Extract booking ID from metadata
      const bookingId = paymentIntent.metadata?.bookingId;

      if (!bookingId) {
        return { success: false, error: 'Missing booking ID in metadata' };
      }

      // Handle different event types
      switch (eventType) {
        case 'payment_intent.succeeded':
          return await paymentService.confirmStripePayment(paymentIntent.id, bookingId);

        case 'payment_intent.payment_failed':
          // Update payment status to failed
          await prisma.$executeRaw`
            UPDATE Payment
            SET status = 'failed',
                errorMessage = ${paymentIntent.last_payment_error?.message || 'Payment failed'},
                updatedAt = datetime('now')
            WHERE paymentKey = ${paymentIntent.id}
          `;
          return { success: true };

        case 'charge.refunded':
          // Handle refund completion
          return { success: true };

        default:
          console.log(`Unhandled Stripe event type: ${eventType}`);
          return { success: true }; // Don't retry for unhandled events
      }
    } catch (error: any) {
      console.error('Process Stripe webhook error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process TossPay webhook event
   */
  private async processTossPayWebhook(payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      // TossPay webhook structure
      const eventType = payload.eventType || payload.type;
      const orderId = payload.orderId;

      if (!orderId) {
        return { success: false, error: 'Missing order ID' };
      }

      // Get booking ID from order ID
      const payment: any = await prisma.$queryRaw`
        SELECT bookingId FROM Payment
        WHERE orderId = ${orderId}
        LIMIT 1
      `;

      if (!payment || payment.length === 0) {
        return { success: false, error: 'Payment not found for order ID' };
      }

      const bookingId = payment[0].bookingId;

      // Handle different event types
      switch (eventType) {
        case 'PAYMENT_CONFIRMED':
        case 'payment.confirmed':
          return await paymentService.confirmTossPayment({
            paymentKey: payload.paymentKey,
            orderId: payload.orderId,
            amount: payload.amount,
          });

        case 'PAYMENT_FAILED':
        case 'payment.failed':
          await prisma.$executeRaw`
            UPDATE Payment
            SET status = 'failed',
                errorMessage = ${payload.message || 'Payment failed'},
                updatedAt = datetime('now')
            WHERE orderId = ${orderId}
          `;
          return { success: true };

        case 'REFUND_COMPLETED':
        case 'refund.completed':
          // Handle refund completion
          return { success: true };

        default:
          console.log(`Unhandled TossPay event type: ${eventType}`);
          return { success: true }; // Don't retry for unhandled events
      }
    } catch (error: any) {
      console.error('Process TossPay webhook error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const baseDelay = 1000; // 1 second
    const maxDelay = 60000; // 1 minute
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    return delay;
  }

  /**
   * Retry failed webhooks (can be run as a cron job)
   */
  async retryFailedWebhooks(): Promise<number> {
    try {
      // Get all pending webhooks that haven't reached max attempts
      const failedWebhooks: any = await prisma.$queryRaw`
        SELECT id FROM WebhookLog
        WHERE status = 'pending'
          AND attemptCount < maxAttempts
          AND (
            lastAttemptAt IS NULL
            OR datetime(lastAttemptAt, '+' || (1 << attemptCount) || ' seconds') < datetime('now')
          )
        ORDER BY createdAt ASC
        LIMIT 100
      `;

      let processedCount = 0;

      for (const webhook of failedWebhooks) {
        await this.processWebhook(webhook.id);
        processedCount++;
      }

      return processedCount;
    } catch (error: any) {
      console.error('Retry failed webhooks error:', error);
      return 0;
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(): Promise<any> {
    try {
      const stats: any = await prisma.$queryRaw`
        SELECT
          status,
          COUNT(*) as count
        FROM WebhookLog
        WHERE createdAt > datetime('now', '-7 days')
        GROUP BY status
      `;

      return stats;
    } catch (error: any) {
      console.error('Get webhook stats error:', error);
      return [];
    }
  }

  // Helper methods
  private generateId(): string {
    return `WH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const webhookRetryService = new WebhookRetryService();
