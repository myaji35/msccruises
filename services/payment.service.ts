/**
 * Payment Service
 *
 * Handles payment processing for TossPay and Stripe
 * Ensures PCI-DSS compliance by never storing card data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: 'tosspay' | 'stripe';
  customerEmail: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  status?: 'pending' | 'completed' | 'failed';
  redirectUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TossPayConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface StripePaymentIntentRequest {
  amount: number;
  currency: string;
  metadata: Record<string, any>;
}

class PaymentService {
  private tossPaySecretKey: string;
  private tossPayClientKey: string;
  private stripeSecretKey: string;

  constructor() {
    this.tossPaySecretKey = process.env.TOSSPAY_SECRET_KEY || '';
    this.tossPayClientKey = process.env.TOSSPAY_CLIENT_KEY || '';
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

    if (!this.tossPaySecretKey || !this.tossPayClientKey) {
      console.warn('TossPay credentials not configured');
    }

    if (!this.stripeSecretKey) {
      console.warn('Stripe credentials not configured');
    }
  }

  /**
   * Initialize payment request
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate booking exists
      const booking = await prisma.booking.findUnique({
        where: { id: request.bookingId },
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found',
        };
      }

      // Create payment record
      const payment = await prisma.$queryRaw`
        INSERT INTO Payment (
          id, bookingId, amount, currency, paymentMethod, status, createdAt, updatedAt
        ) VALUES (
          ${this.generateId()},
          ${request.bookingId},
          ${request.amount},
          ${request.currency},
          ${request.paymentMethod},
          'pending',
          datetime('now'),
          datetime('now')
        )
      ` as any;

      // Route to appropriate payment provider
      if (request.paymentMethod === 'tosspay') {
        return await this.initiateTossPayment(request);
      } else if (request.paymentMethod === 'stripe') {
        return await this.initiateStripePayment(request);
      }

      return {
        success: false,
        error: 'Invalid payment method',
      };
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error.message || 'Payment initiation failed',
      };
    }
  }

  /**
   * TossPay: Initialize payment
   */
  private async initiateTossPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // TossPay uses client-side SDK, so we return the configuration
      return {
        success: true,
        orderId,
        status: 'pending',
        metadata: {
          clientKey: this.tossPayClientKey,
          amount: request.amount,
          orderId,
          orderName: `MSC Cruise Booking - ${request.bookingId.slice(0, 8)}`,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          successUrl: request.successUrl,
          failUrl: request.failUrl,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'TossPay initialization failed',
      };
    }
  }

  /**
   * TossPay: Confirm payment after user approval
   */
  async confirmTossPayment(confirmRequest: TossPayConfirmRequest): Promise<PaymentResult> {
    try {
      const { paymentKey, orderId, amount } = confirmRequest;

      // Call TossPay Confirm API
      const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.tossPaySecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'TossPay confirmation failed');
      }

      const paymentData = await response.json();

      // Update payment record
      await prisma.$executeRaw`
        UPDATE Payment
        SET status = 'completed',
            paymentKey = ${paymentKey},
            paidAt = datetime('now'),
            updatedAt = datetime('now')
        WHERE orderId = ${orderId}
      `;

      // Update booking payment status
      await prisma.booking.updateMany({
        where: {
          id: {
            in: await this.getBookingIdFromOrderId(orderId),
          },
        },
        data: {
          paymentStatus: 'paid',
        },
      });

      return {
        success: true,
        paymentId: paymentData.paymentKey,
        orderId: paymentData.orderId,
        status: 'completed',
        metadata: paymentData,
      };
    } catch (error: any) {
      console.error('TossPay confirmation error:', error);

      // Update payment status to failed
      await prisma.$executeRaw`
        UPDATE Payment
        SET status = 'failed',
            errorMessage = ${error.message},
            updatedAt = datetime('now')
        WHERE orderId = ${confirmRequest.orderId}
      `;

      return {
        success: false,
        error: error.message || 'TossPay confirmation failed',
      };
    }
  }

  /**
   * Stripe: Initialize payment intent
   */
  private async initiateStripePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Stripe requires server-side initialization
      const Stripe = require('stripe');
      const stripe = new Stripe(this.stripeSecretKey, {
        apiVersion: '2024-11-20.acacia',
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        metadata: {
          bookingId: request.bookingId,
          ...request.metadata,
        },
        receipt_email: request.customerEmail,
      });

      // Update payment record with Stripe payment intent ID
      await prisma.$executeRaw`
        UPDATE Payment
        SET paymentKey = ${paymentIntent.id},
            updatedAt = datetime('now')
        WHERE bookingId = ${request.bookingId}
          AND status = 'pending'
      `;

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: 'pending',
        metadata: {
          clientSecret: paymentIntent.client_secret,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        },
      };
    } catch (error: any) {
      console.error('Stripe initialization error:', error);
      return {
        success: false,
        error: error.message || 'Stripe initialization failed',
      };
    }
  }

  /**
   * Stripe: Confirm payment (webhook handler)
   */
  async confirmStripePayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(this.stripeSecretKey, {
        apiVersion: '2024-11-20.acacia',
      });

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update payment record
        await prisma.$executeRaw`
          UPDATE Payment
          SET status = 'completed',
              paidAt = datetime('now'),
              updatedAt = datetime('now')
          WHERE paymentKey = ${paymentIntentId}
        `;

        // Update booking
        const bookingId = paymentIntent.metadata.bookingId;
        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'paid' },
          });
        }

        return {
          success: true,
          paymentId: paymentIntentId,
          status: 'completed',
          metadata: paymentIntent,
        };
      }

      return {
        success: false,
        error: `Payment status: ${paymentIntent.status}`,
      };
    } catch (error: any) {
      console.error('Stripe confirmation error:', error);
      return {
        success: false,
        error: error.message || 'Stripe confirmation failed',
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(bookingId: string): Promise<PaymentResult> {
    try {
      const payment: any = await prisma.$queryRaw`
        SELECT * FROM Payment
        WHERE bookingId = ${bookingId}
        ORDER BY createdAt DESC
        LIMIT 1
      `;

      if (!payment || payment.length === 0) {
        return {
          success: false,
          error: 'Payment not found',
        };
      }

      const paymentRecord = payment[0];

      return {
        success: true,
        paymentId: paymentRecord.paymentKey,
        orderId: paymentRecord.orderId,
        status: paymentRecord.status,
        metadata: {
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          paymentMethod: paymentRecord.paymentMethod,
          createdAt: paymentRecord.createdAt,
          paidAt: paymentRecord.paidAt,
        },
      };
    } catch (error: any) {
      console.error('Get payment status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get payment status',
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(bookingId: string, amount?: number): Promise<PaymentResult> {
    try {
      const payment: any = await prisma.$queryRaw`
        SELECT * FROM Payment
        WHERE bookingId = ${bookingId}
          AND status = 'completed'
        ORDER BY createdAt DESC
        LIMIT 1
      `;

      if (!payment || payment.length === 0) {
        return {
          success: false,
          error: 'No completed payment found',
        };
      }

      const paymentRecord = payment[0];
      const refundAmount = amount || paymentRecord.amount;

      if (paymentRecord.paymentMethod === 'tosspay') {
        return await this.refundTossPayment(paymentRecord.paymentKey, refundAmount);
      } else if (paymentRecord.paymentMethod === 'stripe') {
        return await this.refundStripePayment(paymentRecord.paymentKey, refundAmount);
      }

      return {
        success: false,
        error: 'Invalid payment method',
      };
    } catch (error: any) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error.message || 'Refund failed',
      };
    }
  }

  /**
   * TossPay: Refund
   */
  private async refundTossPayment(paymentKey: string, amount: number): Promise<PaymentResult> {
    try {
      const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.tossPaySecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: 'Customer requested refund',
          cancelAmount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'TossPay refund failed');
      }

      const refundData = await response.json();

      // Update payment status
      await prisma.$executeRaw`
        UPDATE Payment
        SET status = 'refunded',
            refundedAt = datetime('now'),
            updatedAt = datetime('now')
        WHERE paymentKey = ${paymentKey}
      `;

      return {
        success: true,
        status: 'completed',
        metadata: refundData,
      };
    } catch (error: any) {
      console.error('TossPay refund error:', error);
      return {
        success: false,
        error: error.message || 'TossPay refund failed',
      };
    }
  }

  /**
   * Stripe: Refund
   */
  private async refundStripePayment(paymentIntentId: string, amount: number): Promise<PaymentResult> {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(this.stripeSecretKey, {
        apiVersion: '2024-11-20.acacia',
      });

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
      });

      // Update payment status
      await prisma.$executeRaw`
        UPDATE Payment
        SET status = 'refunded',
            refundedAt = datetime('now'),
            updatedAt = datetime('now')
        WHERE paymentKey = ${paymentIntentId}
      `;

      return {
        success: true,
        status: 'completed',
        metadata: refund,
      };
    } catch (error: any) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message || 'Stripe refund failed',
      };
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string): Promise<PaymentResult> {
    try {
      const payments: any = await prisma.$queryRaw`
        SELECT
          p.id,
          p.bookingId,
          p.amount,
          p.currency,
          p.paymentMethod,
          p.status,
          p.paymentKey,
          p.orderId,
          p.createdAt,
          p.completedAt,
          p.refundedAt,
          b.cruiseId,
          c.name as cruiseName,
          c.shipName
        FROM Payment p
        LEFT JOIN Booking b ON p.bookingId = b.id
        LEFT JOIN Cruise c ON b.cruiseId = c.id
        WHERE b.userId = ${userId}
        ORDER BY p.createdAt DESC
      `;

      return {
        success: true,
        metadata: { payments },
      };
    } catch (error: any) {
      console.error('Get payment history error:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve payment history',
      };
    }
  }

  /**
   * Get payment details by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentResult> {
    try {
      const payment: any = await prisma.$queryRaw`
        SELECT
          p.*,
          b.cruiseId,
          b.cabinCategory,
          b.numPassengers,
          c.name as cruiseName,
          c.shipName,
          c.departureDate,
          c.returnDate
        FROM Payment p
        LEFT JOIN Booking b ON p.bookingId = b.id
        LEFT JOIN Cruise c ON b.cruiseId = c.id
        WHERE p.id = ${paymentId}
      `;

      if (!payment || payment.length === 0) {
        return {
          success: false,
          error: 'Payment not found',
        };
      }

      return {
        success: true,
        metadata: payment[0],
      };
    } catch (error: any) {
      console.error('Get payment by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve payment details',
      };
    }
  }

  // Helper methods
  private generateId(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getBookingIdFromOrderId(orderId: string): Promise<string[]> {
    const payment: any = await prisma.$queryRaw`
      SELECT bookingId FROM Payment
      WHERE orderId = ${orderId}
    `;
    return payment.map((p: any) => p.bookingId);
  }
}

export const paymentService = new PaymentService();
