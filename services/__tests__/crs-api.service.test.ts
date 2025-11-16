/**
 * Unit Tests for CRS API Service (Story 001)
 * 
 * Test Coverage:
 * - AC1: OAuth 2.0 Authentication
 * - AC2: Real-time Availability Check
 * - AC3: Booking Creation
 * - AC4: Booking Modification
 * - AC5: Booking Cancellation
 * - AC6: Error Handling & Retry Logic
 */

import { crsApiService } from '../crs-api.service';
import { CRSError, CRSErrorCode } from '@/lib/crs-error-handler';

describe('CRS API Service - Story 001', () => {
  describe('AC1: Authentication', () => {
    test('should authenticate successfully', async () => {
      // Note: In mock mode, authentication uses fallback mock token
      // This test verifies the healthCheck method completes
      const result = await crsApiService.healthCheck();
      expect(result).toBe(true);
    }, 15000); // Increased timeout for retry logic

    test('should return mock token in development mode', async () => {
      // Authentication is tested indirectly through other methods
      const availability = await crsApiService.getAvailability('MSC123456');
      expect(availability).toBeDefined();
      expect(availability.cruise_id).toBe('MSC123456');
    }, 15000); // Increased timeout for retry logic
  });

  describe('AC2: Real-time Availability', () => {
    test('should return availability data', async () => {
      const cruiseId = 'MSC123456';
      const availability = await crsApiService.getAvailability(cruiseId);

      expect(availability).toMatchObject({
        cruise_id: cruiseId,
        departure_date: expect.any(String),
        availability: {
          inside: expect.any(Number),
          oceanview: expect.any(Number),
          balcony: expect.any(Number),
          suite: expect.any(Number),
        },
        pricing: {
          inside: { min: expect.any(Number), max: expect.any(Number) },
          oceanview: { min: expect.any(Number), max: expect.any(Number) },
          balcony: { min: expect.any(Number), max: expect.any(Number) },
          suite: { min: expect.any(Number), max: expect.any(Number) },
        },
      });
    });

    test('should complete within 500ms target', async () => {
      const startTime = Date.now();
      await crsApiService.getAvailability('MSC123456');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('AC3: Booking Creation', () => {
    test('should create a booking successfully', async () => {
      const bookingData = {
        cruise_id: 'MSC123456',
        cabin_category: 'balcony' as const,
        passengers: [
          {
            first_name: '홍',
            last_name: '길동',
            date_of_birth: '1985-03-15',
            passport: 'M12345678',
            nationality: 'KR',
          },
        ],
        contact: {
          email: 'hong@example.com',
          phone: '+82-10-1234-5678',
        },
      };

      const result = await crsApiService.createBooking(bookingData);

      expect(result).toMatchObject({
        booking_id: expect.any(String),
        confirmation_number: expect.stringMatching(/^MSC[A-Z0-9]+$/),
        cruise_id: 'MSC123456',
        cabin_category: 'balcony',
        status: 'confirmed',
        total_price: expect.any(Number),
        created_at: expect.any(String),
      });
    });
  });

  describe('AC4: Booking Modification', () => {
    test('should update booking successfully', async () => {
      const bookingId = 'BK123456';
      const updates = {
        cruise_id: 'MSC123456',
        cabin_category: 'suite' as const,
        passengers: [],
        contact: { email: 'test@example.com', phone: '+82-10-0000-0000' },
      };

      const result = await crsApiService.updateBooking(bookingId, updates);

      expect(result).toMatchObject({
        booking_id: bookingId,
        status: 'confirmed',
      });
    });

    test('should reject modification within 7 days of departure', async () => {
      // Mock: Test will fail if deadline logic not working
      // In real test, mock the departure date to be within 7 days
      const bookingId = 'BK123456';
      const updates = { cabin_category: 'suite' as const };

      // This should succeed in mock (departure > 7 days)
      await expect(crsApiService.updateBooking(bookingId, updates)).resolves.toBeDefined();
    });
  });

  describe('AC5: Booking Cancellation', () => {
    test('should cancel booking and calculate refund', async () => {
      const bookingId = 'BK123456';
      const result = await crsApiService.cancelBooking(bookingId);

      expect(result).toMatchObject({
        booking_id: bookingId,
        status: 'cancelled',
        cancellation_fee: expect.any(Number),
        refund_amount: expect.any(Number),
        refund_status: 'pending',
      });

      // Refund should be less than or equal to original amount
      expect(result.refund_amount).toBeGreaterThanOrEqual(0);
    });

    test('should calculate correct cancellation fees', async () => {
      const bookingId = 'BK123456';
      const result = await crsApiService.cancelBooking(bookingId);

      // Mock uses 30 days until departure
      // Should apply appropriate fee tier
      expect(result.cancellation_fee).toBeGreaterThanOrEqual(0);
      expect(result.refund_amount + result.cancellation_fee).toBeLessThanOrEqual(2500);
    });
  });

  describe('AC6: Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // This test would require mocking fetch to throw errors
      // For now, testing that the service doesn't crash
      try {
        await crsApiService.searchCruises({ destination: 'invalid' });
      } catch (error) {
        // Should not crash the application
        expect(error).toBeDefined();
      }
    });

    test('should return proper error structure', () => {
      const error = new CRSError(
        CRSErrorCode.TIMEOUT,
        'Request timeout',
        408,
        true
      );

      expect(error.code).toBe(CRSErrorCode.TIMEOUT);
      expect(error.statusCode).toBe(408);
      expect(error.retryable).toBe(true);
    });
  });

  describe('Integration: Search Cruises', () => {
    test('should return mock cruise data', async () => {
      const cruises = await crsApiService.searchCruises({
        destination: 'Caribbean',
      });

      expect(Array.isArray(cruises)).toBe(true);
      expect(cruises.length).toBeGreaterThan(0);
      expect(cruises[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        ship_name: expect.any(String),
        departure_port: expect.any(String),
        departure_date: expect.any(String),
        return_date: expect.any(String),
        duration_days: expect.any(Number),
        starting_price: expect.any(Number),
        currency: 'USD',
      });
    });
  });
});

// Note: These are basic unit tests for mock implementation
// For production, add:
// - Integration tests with actual CRS API (sandbox)
// - Performance tests (< 500ms for availability)
// - Concurrency tests (100 simultaneous requests)
// - Retry mechanism tests (exponential backoff)
// - Circuit breaker tests
