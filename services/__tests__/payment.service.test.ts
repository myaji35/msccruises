/**
 * PaymentService Unit Tests
 *
 * Tests payment processing logic for TossPay and Stripe
 */

import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock fetch for external API calls
global.fetch = jest.fn();

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
  }));
});

describe('PaymentService', () => {
  let paymentService: any;
  let mockPrisma: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Get mocked Prisma instance
    mockPrisma = new PrismaClient();

    // Set up environment variables
    process.env.TOSSPAY_SECRET_KEY = 'test_sk_mock';
    process.env.TOSSPAY_CLIENT_KEY = 'test_ck_mock';
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';

    // Import PaymentService singleton
    const { paymentService: service } = require('../payment.service');
    paymentService = service;
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('initiatePayment', () => {
    it('should return error if booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      const request = {
        bookingId: 'non-existent',
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'tosspay' as const,
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        successUrl: 'http://localhost/success',
        failUrl: 'http://localhost/fail',
      };

      const result = await paymentService.initiatePayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Booking not found');
    });

    it('should create payment record and initiate TossPay payment', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        totalAmount: 1000,
        status: 'confirmed',
      });

      mockPrisma.$queryRaw.mockResolvedValue([{ id: 'payment-123' }]);

      const request = {
        bookingId: 'booking-123',
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'tosspay' as const,
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        successUrl: 'http://localhost/success',
        failUrl: 'http://localhost/fail',
      };

      const result = await paymentService.initiatePayment(request);

      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
      });

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it('should create payment record and initiate Stripe payment', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        totalAmount: 1000,
        status: 'confirmed',
      });

      mockPrisma.$queryRaw.mockResolvedValue([{ id: 'payment-123' }]);

      const mockStripe = require('stripe');
      const stripeInstance = mockStripe();
      stripeInstance.paymentIntents.create.mockResolvedValue({
        id: 'pi_mock123',
        client_secret: 'pi_mock123_secret',
        status: 'requires_payment_method',
      });

      const request = {
        bookingId: 'booking-123',
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'stripe' as const,
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        successUrl: 'http://localhost/success',
        failUrl: 'http://localhost/fail',
      };

      const result = await paymentService.initiatePayment(request);

      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('confirmTossPayment', () => {
    it('should confirm TossPay payment successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'DONE',
          orderId: 'ORDER-123',
          paymentKey: 'payment-key-123',
        }),
      });

      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.booking.update.mockResolvedValue({
        id: 'booking-123',
        paymentStatus: 'paid',
      });

      const confirmRequest = {
        paymentKey: 'payment-key-123',
        orderId: 'ORDER-123',
        amount: 1000,
      };

      const result = await paymentService.confirmTossPayment(confirmRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.tosspayments.com/v1/payments/confirm',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
    });

    it('should handle TossPay confirmation failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({
          code: 'INVALID_REQUEST',
          message: 'Payment key is invalid',
        }),
      });

      const confirmRequest = {
        paymentKey: 'invalid-key',
        orderId: 'ORDER-123',
        amount: 1000,
      };

      const result = await paymentService.confirmTossPayment(confirmRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('confirmStripePayment', () => {
    it('should confirm Stripe payment successfully', async () => {
      const mockStripe = require('stripe');
      const stripeInstance = mockStripe();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_mock123',
        status: 'succeeded',
        metadata: {
          bookingId: 'booking-123',
        },
      });

      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'payment-123',
        bookingId: 'booking-123',
        status: 'pending',
      });

      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.booking.update.mockResolvedValue({
        id: 'booking-123',
        paymentStatus: 'paid',
      });

      const result = await paymentService.confirmStripePayment('pi_mock123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
    });

    it('should return error if payment not found', async () => {
      const mockStripe = require('stripe');
      const stripeInstance = mockStripe();

      stripeInstance.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_mock123',
        status: 'succeeded',
        metadata: {
          bookingId: 'booking-123',
        },
      });

      mockPrisma.payment.findFirst.mockResolvedValue(null);

      const result = await paymentService.confirmStripePayment('pi_mock123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not found');
    });
  });

  describe('refundPayment', () => {
    it('should refund TossPay payment successfully', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        paymentKey: 'payment-key-123',
        paymentMethod: 'tosspay',
        status: 'completed',
        amount: 1000,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'CANCELED',
        }),
      });

      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.booking.update.mockResolvedValue({
        id: 'booking-123',
        paymentStatus: 'refunded',
      });

      const result = await paymentService.refundPayment('payment-123', 1000, 'Customer request');

      expect(result.success).toBe(true);
      expect(result.status).toBe('refunded');
    });

    it('should refund Stripe payment successfully', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        paymentKey: 'pi_mock123',
        paymentMethod: 'stripe',
        status: 'completed',
        amount: 1000,
        bookingId: 'booking-123',
      });

      const mockStripe = require('stripe');
      const stripeInstance = mockStripe();

      stripeInstance.refunds.create.mockResolvedValue({
        id: 'ref_mock123',
        status: 'succeeded',
        amount: 100000,
      });

      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.booking.update.mockResolvedValue({
        id: 'booking-123',
        paymentStatus: 'refunded',
      });

      const result = await paymentService.refundPayment('payment-123', 1000, 'Customer request');

      expect(result.success).toBe(true);
      expect(result.status).toBe('refunded');
    });

    it('should return error if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      const result = await paymentService.refundPayment('non-existent', 1000, 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not found');
    });

    it('should return error if payment not completed', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        status: 'pending',
      });

      const result = await paymentService.refundPayment('payment-123', 1000, 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not completed');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status successfully', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'payment-123',
        bookingId: 'booking-123',
        status: 'completed',
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'tosspay',
        createdAt: new Date(),
        paidAt: new Date(),
      });

      const result = await paymentService.getPaymentStatus('booking-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.metadata).toBeDefined();
    });

    it('should return error if payment not found', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      const result = await paymentService.getPaymentStatus('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not found');
    });
  });
});
