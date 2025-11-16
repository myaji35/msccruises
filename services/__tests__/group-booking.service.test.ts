/**
 * GroupBookingService Unit Tests
 *
 * Tests group booking logic including creation, cabin management, and discount calculation
 */

import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    groupBooking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    cruise: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('GroupBookingService', () => {
  let groupBookingService: any;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = new PrismaClient();

    // Default mock responses
    mockPrisma.cruise.findUnique.mockResolvedValue({
      id: 'cruise-123',
      name: 'Mediterranean Adventure',
      basePrice: 1000,
      startingPrice: 1000,
      departureDate: new Date('2025-12-01'),
      returnDate: new Date('2025-12-08'),
    });

    // Import GroupBookingService singleton or class
    const module = require('../group-booking.service');
    groupBookingService = module.groupBookingService || new module.GroupBookingService();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('createGroupBooking', () => {
    it('should create group booking with 3 cabins successfully', async () => {
      const cabins = [
        {
          cabinCategory: 'inside',
          passengers: [
            { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
          ],
        },
        {
          cabinCategory: 'inside',
          passengers: [
            { firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com' },
            { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
          ],
        },
        {
          cabinCategory: 'balcony',
          passengers: [
            { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
            { firstName: 'Lucy', lastName: 'Brown', email: 'lucy@example.com' },
          ],
        },
      ];

      mockPrisma.groupBooking.create.mockResolvedValue({
        id: 'group-123',
        cruiseId: 'cruise-123',
        groupName: 'Family Reunion',
        numCabins: 3,
        totalAmount: 2850,
        discountRate: 0.05,
        status: 'pending',
      });

      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-123',
        groupBookingId: 'group-123',
      });

      const request = {
        cruiseId: 'cruise-123',
        groupName: 'Family Reunion',
        organizer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        cabins,
      };

      const result = await groupBookingService.createGroupBooking(request);

      expect(result.success).toBe(true);
      expect(result.data.numCabins).toBe(3);
      expect(result.data.discountRate).toBe(0.05); // 5% for 3-5 cabins
      expect(mockPrisma.groupBooking.create).toHaveBeenCalled();
    });

    it('should apply 10% discount for 6 cabins', async () => {
      const cabins = Array(6).fill({
        cabinCategory: 'inside',
        passengers: [
          { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
          { firstName: 'Test2', lastName: 'User2', email: 'test2@example.com' },
        ],
      });

      mockPrisma.groupBooking.create.mockResolvedValue({
        id: 'group-123',
        numCabins: 6,
        discountRate: 0.10,
      });

      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-123',
      });

      const request = {
        cruiseId: 'cruise-123',
        groupName: 'Large Group',
        organizer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        cabins,
      };

      const result = await groupBookingService.createGroupBooking(request);

      expect(result.data.discountRate).toBe(0.10);
    });

    it('should apply 15% discount for 11 cabins', async () => {
      const cabins = Array(11).fill({
        cabinCategory: 'inside',
        passengers: [
          { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
          { firstName: 'Test2', lastName: 'User2', email: 'test2@example.com' },
        ],
      });

      mockPrisma.groupBooking.create.mockResolvedValue({
        id: 'group-123',
        numCabins: 11,
        discountRate: 0.15,
      });

      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-123',
      });

      const request = {
        cruiseId: 'cruise-123',
        groupName: 'Very Large Group',
        organizer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        cabins,
      };

      const result = await groupBookingService.createGroupBooking(request);

      expect(result.data.discountRate).toBe(0.15);
    });

    it('should reject booking with less than 3 cabins', async () => {
      const cabins = [
        {
          cabinCategory: 'inside',
          passengers: [
            { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          ],
        },
        {
          cabinCategory: 'inside',
          passengers: [
            { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
          ],
        },
      ];

      const request = {
        cruiseId: 'cruise-123',
        groupName: 'Too Small',
        organizer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        cabins,
      };

      const result = await groupBookingService.createGroupBooking(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('minimum');
    });

    it('should require sales team contact for 16+ cabins', async () => {
      const cabins = Array(16).fill({
        cabinCategory: 'inside',
        passengers: [
          { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        ],
      });

      const request = {
        cruiseId: 'cruise-123',
        groupName: 'Enterprise Group',
        organizer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        cabins,
      };

      const result = await groupBookingService.createGroupBooking(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('sales team');
    });

    it('should return error if cruise not found', async () => {
      mockPrisma.cruise.findUnique.mockResolvedValue(null);

      const request = {
        cruiseId: 'non-existent',
        groupName: 'Test Group',
        organizer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        cabins: [
          {
            cabinCategory: 'inside',
            passengers: [
              { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
            ],
          },
          {
            cabinCategory: 'inside',
            passengers: [
              { firstName: 'Test2', lastName: 'User2', email: 'test2@example.com' },
            ],
          },
          {
            cabinCategory: 'inside',
            passengers: [
              { firstName: 'Test3', lastName: 'User3', email: 'test3@example.com' },
            ],
          },
        ],
      };

      const result = await groupBookingService.createGroupBooking(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cruise not found');
    });
  });

  describe('addCabinToGroup', () => {
    it('should add cabin and recalculate discount', async () => {
      mockPrisma.groupBooking.findUnique.mockResolvedValue({
        id: 'group-123',
        cruiseId: 'cruise-123',
        numCabins: 5,
        totalAmount: 4750,
        discountRate: 0.05,
        status: 'pending',
      });

      mockPrisma.groupBooking.update.mockResolvedValue({
        id: 'group-123',
        numCabins: 6,
        discountRate: 0.10, // Upgraded to 10%
      });

      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-new',
      });

      const cabin = {
        cabinCategory: 'inside',
        passengers: [
          { firstName: 'New', lastName: 'Guest', email: 'new@example.com' },
          { firstName: 'New2', lastName: 'Guest2', email: 'new2@example.com' },
        ],
      };

      const result = await groupBookingService.addCabinToGroup('group-123', cabin);

      expect(result.success).toBe(true);
      expect(result.data.numCabins).toBe(6);
      expect(result.data.discountRate).toBe(0.10);
    });

    it('should reject adding cabin to non-existent group', async () => {
      mockPrisma.groupBooking.findUnique.mockResolvedValue(null);

      const cabin = {
        cabinCategory: 'inside',
        passengers: [
          { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        ],
      };

      const result = await groupBookingService.addCabinToGroup('non-existent', cabin);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should reject adding cabin to confirmed group', async () => {
      mockPrisma.groupBooking.findUnique.mockResolvedValue({
        id: 'group-123',
        status: 'confirmed',
      });

      const cabin = {
        cabinCategory: 'inside',
        passengers: [
          { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        ],
      };

      const result = await groupBookingService.addCabinToGroup('group-123', cabin);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot modify');
    });
  });

  describe('removeCabinFromGroup', () => {
    it('should remove cabin and recalculate discount', async () => {
      mockPrisma.groupBooking.findUnique.mockResolvedValue({
        id: 'group-123',
        cruiseId: 'cruise-123',
        numCabins: 6,
        totalAmount: 5700,
        discountRate: 0.10,
        status: 'pending',
      });

      mockPrisma.booking.findMany.mockResolvedValue([
        { id: 'booking-1' },
        { id: 'booking-2' },
        { id: 'booking-3' },
        { id: 'booking-4' },
        { id: 'booking-5' },
        { id: 'booking-6' },
      ]);

      mockPrisma.booking.delete.mockResolvedValue({
        id: 'booking-6',
      });

      mockPrisma.groupBooking.update.mockResolvedValue({
        id: 'group-123',
        numCabins: 5,
        discountRate: 0.05, // Downgraded to 5%
      });

      const result = await groupBookingService.removeCabinFromGroup(
        'group-123',
        'booking-6'
      );

      expect(result.success).toBe(true);
      expect(result.data.numCabins).toBe(5);
      expect(result.data.discountRate).toBe(0.05);
    });

    it('should reject removing cabin if it would go below 3 cabins', async () => {
      mockPrisma.groupBooking.findUnique.mockResolvedValue({
        id: 'group-123',
        numCabins: 3,
        status: 'pending',
      });

      mockPrisma.booking.findMany.mockResolvedValue([
        { id: 'booking-1' },
        { id: 'booking-2' },
        { id: 'booking-3' },
      ]);

      const result = await groupBookingService.removeCabinFromGroup(
        'group-123',
        'booking-3'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('minimum');
    });
  });

  describe('calculateGroupDiscount', () => {
    it('should return 0% for 1-2 cabins', () => {
      expect(groupBookingService.calculateGroupDiscount(1)).toBe(0);
      expect(groupBookingService.calculateGroupDiscount(2)).toBe(0);
    });

    it('should return 5% for 3-5 cabins', () => {
      expect(groupBookingService.calculateGroupDiscount(3)).toBe(0.05);
      expect(groupBookingService.calculateGroupDiscount(4)).toBe(0.05);
      expect(groupBookingService.calculateGroupDiscount(5)).toBe(0.05);
    });

    it('should return 10% for 6-10 cabins', () => {
      expect(groupBookingService.calculateGroupDiscount(6)).toBe(0.10);
      expect(groupBookingService.calculateGroupDiscount(8)).toBe(0.10);
      expect(groupBookingService.calculateGroupDiscount(10)).toBe(0.10);
    });

    it('should return 15% for 11+ cabins', () => {
      expect(groupBookingService.calculateGroupDiscount(11)).toBe(0.15);
      expect(groupBookingService.calculateGroupDiscount(15)).toBe(0.15);
      expect(groupBookingService.calculateGroupDiscount(20)).toBe(0.15);
    });
  });

  describe('getGroupBookings', () => {
    it('should return all group bookings for a user', async () => {
      mockPrisma.groupBooking.findMany.mockResolvedValue([
        {
          id: 'group-1',
          groupName: 'Family Trip',
          numCabins: 4,
          status: 'confirmed',
        },
        {
          id: 'group-2',
          groupName: 'Friends Getaway',
          numCabins: 6,
          status: 'pending',
        },
      ]);

      const result = await groupBookingService.getGroupBookings('user-123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array if no group bookings found', async () => {
      mockPrisma.groupBooking.findMany.mockResolvedValue([]);

      const result = await groupBookingService.getGroupBookings('user-123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getGroupBookingById', () => {
    it('should return group booking with all cabins', async () => {
      mockPrisma.groupBooking.findUnique.mockResolvedValue({
        id: 'group-123',
        groupName: 'Family Trip',
        numCabins: 3,
        totalAmount: 2850,
        discountRate: 0.05,
        cruise: {
          name: 'Mediterranean Adventure',
          departureDate: new Date('2025-12-01'),
        },
        bookings: [
          {
            id: 'booking-1',
            cabinCategory: 'inside',
            passengers: [
              { firstName: 'John', lastName: 'Doe' },
            ],
          },
          {
            id: 'booking-2',
            cabinCategory: 'inside',
            passengers: [
              { firstName: 'Jane', lastName: 'Doe' },
            ],
          },
          {
            id: 'booking-3',
            cabinCategory: 'balcony',
            passengers: [
              { firstName: 'Bob', lastName: 'Smith' },
            ],
          },
        ],
      });

      const result = await groupBookingService.getGroupBookingById('group-123');

      expect(result.success).toBe(true);
      expect(result.data.numCabins).toBe(3);
      expect(result.data.bookings).toHaveLength(3);
    });

    it('should return error if group booking not found', async () => {
      mockPrisma.groupBooking.findUnique.mockResolvedValue(null);

      const result = await groupBookingService.getGroupBookingById('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
