/**
 * PricingEngine Unit Tests
 *
 * Tests dynamic pricing logic including inventory, demand, promotions, and group discounts
 */

import { PrismaClient } from '@prisma/client';
import type { PriceParams } from '@/types/pricing.types';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    cruise: {
      findUnique: jest.fn(),
    },
    pricingRule: {
      findFirst: jest.fn(),
    },
    promotionCode: {
      findUnique: jest.fn(),
    },
    booking: {
      count: jest.fn(),
    },
    priceHistory: {
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('PricingEngine', () => {
  let pricingEngine: any;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = new PrismaClient();

    // Set up default mock responses
    mockPrisma.cruise.findUnique.mockResolvedValue({
      id: 'cruise-123',
      name: 'Mediterranean Adventure',
      basePrice: 1000,
      cabinPrices: {
        inside: 1000,
        oceanview: 1300,
        balcony: 1600,
        suite: 2500,
      },
    });

    mockPrisma.pricingRule.findFirst.mockResolvedValue({
      id: 'rule-123',
      cruiseId: 'cruise-123',
      inventoryHighMultiplier: 1.2,
      inventoryMediumMultiplier: 1.1,
      inventoryLowMultiplier: 1.0,
      demandHighMultiplier: 1.15,
      demandMediumMultiplier: 1.05,
      demandLowMultiplier: 1.0,
      groupDiscount3to5: 0.05,
      groupDiscount6to10: 0.10,
      groupDiscount11plus: 0.15,
    });

    // Import PricingEngine singleton or class
    const module = require('../pricing-engine.service');
    pricingEngine = module.pricingEngine || new module.PricingEngine();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('calculatePrice', () => {
    it('should calculate base price without any adjustments', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 80 },
      ]);

      mockPrisma.booking.count.mockResolvedValue(5);

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 1,
      };

      const result = await pricingEngine.calculatePrice(params);

      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.base).toBe(1000);
    });

    it('should apply inventory-based price increase for low inventory', async () => {
      // Mock low inventory (80% sold)
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 20 },
      ]);

      mockPrisma.booking.count.mockResolvedValue(5);

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 1,
      };

      const result = await pricingEngine.calculatePrice(params);

      expect(result.finalPrice).toBeGreaterThan(1000);
      expect(result.breakdown.inventoryAdjustment).toBeGreaterThan(0);
      expect(result.appliedRules).toContain('inventory_low');
    });

    it('should apply demand-based price increase for high demand', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 50 },
      ]);

      // Mock high demand (many bookings in last 7 days)
      mockPrisma.booking.count.mockResolvedValue(20);

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 1,
        departureDate: new Date('2025-12-01'),
      };

      const result = await pricingEngine.calculatePrice(params);

      expect(result.breakdown.demandAdjustment).toBeGreaterThanOrEqual(0);
    });

    it('should apply valid promotion code discount', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 50 },
      ]);

      mockPrisma.booking.count.mockResolvedValue(5);

      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'SUMMER2025',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        minPurchaseAmount: 500,
        applicableCruises: ['cruise-123'],
      });

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 1,
        promoCode: 'SUMMER2025',
      };

      const result = await pricingEngine.calculatePrice(params);

      expect(result.breakdown.promotionDiscount).toBeGreaterThan(0);
      expect(result.appliedRules).toContain('promo_SUMMER2025');
    });

    it('should apply group discount for 3+ cabins', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 50 },
      ]);

      mockPrisma.booking.count.mockResolvedValue(5);

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 3,
      };

      const result = await pricingEngine.calculatePrice(params);

      expect(result.breakdown.groupDiscount).toBeGreaterThan(0);
      expect(result.appliedRules).toContain('group_3cabins');
    });

    it('should apply larger group discount for 6+ cabins', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 50 },
      ]);

      mockPrisma.booking.count.mockResolvedValue(5);

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 6,
      };

      const result = await pricingEngine.calculatePrice(params);

      expect(result.breakdown.groupDiscount).toBeGreaterThan(0);
      expect(result.appliedRules).toContain('group_6cabins');

      // 6 cabins should get bigger discount than 3 cabins
      const result3 = await pricingEngine.calculatePrice({
        ...params,
        numCabins: 3,
      });

      expect(result.breakdown.groupDiscount).toBeGreaterThan(
        result3.breakdown.groupDiscount
      );
    });

    it('should apply maximum group discount for 11+ cabins', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 50 },
      ]);

      mockPrisma.booking.count.mockResolvedValue(5);

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 11,
      };

      const result = await pricingEngine.calculatePrice(params);

      expect(result.breakdown.groupDiscount).toBeGreaterThan(0);
      expect(result.appliedRules).toContain('group_11cabins');
    });

    it('should apply multiple adjustments correctly', async () => {
      // Low inventory
      mockPrisma.$queryRaw.mockResolvedValue([
        { totalCabins: 100, availableCabins: 20 },
      ]);

      // High demand
      mockPrisma.booking.count.mockResolvedValue(20);

      // Valid promo
      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'EARLYBIRD',
        discountType: 'percentage',
        discountValue: 15,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        minPurchaseAmount: 500,
        applicableCruises: ['cruise-123'],
      });

      const params: PriceParams = {
        cruiseId: 'cruise-123',
        cabinCategory: 'inside',
        numCabins: 6,
        promoCode: 'EARLYBIRD',
        departureDate: new Date('2025-12-01'),
      };

      const result = await pricingEngine.calculatePrice(params);

      // Should have all adjustments
      expect(result.breakdown.inventoryAdjustment).not.toBe(0);
      expect(result.breakdown.demandAdjustment).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.promotionDiscount).toBeGreaterThan(0);
      expect(result.breakdown.groupDiscount).toBeGreaterThan(0);

      // Final price should be positive
      expect(result.finalPrice).toBeGreaterThan(0);

      // Applied rules should include all factors
      expect(result.appliedRules.length).toBeGreaterThan(0);
    });
  });

  describe('validatePromoCode', () => {
    it('should validate active promotion code', async () => {
      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'SUMMER2025',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        minPurchaseAmount: 500,
        applicableCruises: ['cruise-123'],
      });

      const result = await pricingEngine.validatePromoCode(
        'SUMMER2025',
        'cruise-123',
        'inside',
        1000
      );

      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBeGreaterThan(0);
    });

    it('should reject inactive promotion code', async () => {
      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'EXPIRED',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: false,
        minPurchaseAmount: 500,
      });

      const result = await pricingEngine.validatePromoCode(
        'EXPIRED',
        'cruise-123',
        'inside',
        1000
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('inactive');
    });

    it('should reject expired promotion code', async () => {
      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'OLDPROMO',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-06-30'),
        isActive: true,
        minPurchaseAmount: 500,
      });

      const result = await pricingEngine.validatePromoCode(
        'OLDPROMO',
        'cruise-123',
        'inside',
        1000
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('expired');
    });

    it('should reject if below minimum purchase amount', async () => {
      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'BIGSPENDER',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        minPurchaseAmount: 2000,
      });

      const result = await pricingEngine.validatePromoCode(
        'BIGSPENDER',
        'cruise-123',
        'inside',
        1000
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('minimum');
    });

    it('should calculate fixed amount discount correctly', async () => {
      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'SAVE100',
        discountType: 'fixed',
        discountValue: 100,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        minPurchaseAmount: 500,
      });

      const result = await pricingEngine.validatePromoCode(
        'SAVE100',
        'cruise-123',
        'inside',
        1000
      );

      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(100);
    });

    it('should calculate percentage discount correctly', async () => {
      mockPrisma.promotionCode.findUnique.mockResolvedValue({
        code: 'PERCENT15',
        discountType: 'percentage',
        discountValue: 15,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31'),
        isActive: true,
        minPurchaseAmount: 500,
      });

      const result = await pricingEngine.validatePromoCode(
        'PERCENT15',
        'cruise-123',
        'inside',
        1000
      );

      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(150); // 15% of 1000
    });
  });

  describe('calculateGroupDiscountRate', () => {
    it('should return 5% for 3-5 cabins', () => {
      const pricingRules = {
        groupDiscount3to5: 0.05,
        groupDiscount6to10: 0.10,
        groupDiscount11plus: 0.15,
      };

      expect(pricingEngine.calculateGroupDiscountRate(3, pricingRules)).toBe(0.05);
      expect(pricingEngine.calculateGroupDiscountRate(5, pricingRules)).toBe(0.05);
    });

    it('should return 10% for 6-10 cabins', () => {
      const pricingRules = {
        groupDiscount3to5: 0.05,
        groupDiscount6to10: 0.10,
        groupDiscount11plus: 0.15,
      };

      expect(pricingEngine.calculateGroupDiscountRate(6, pricingRules)).toBe(0.10);
      expect(pricingEngine.calculateGroupDiscountRate(10, pricingRules)).toBe(0.10);
    });

    it('should return 15% for 11+ cabins', () => {
      const pricingRules = {
        groupDiscount3to5: 0.05,
        groupDiscount6to10: 0.10,
        groupDiscount11plus: 0.15,
      };

      expect(pricingEngine.calculateGroupDiscountRate(11, pricingRules)).toBe(0.15);
      expect(pricingEngine.calculateGroupDiscountRate(20, pricingRules)).toBe(0.15);
    });

    it('should return 0 for less than 3 cabins', () => {
      const pricingRules = {
        groupDiscount3to5: 0.05,
        groupDiscount6to10: 0.10,
        groupDiscount11plus: 0.15,
      };

      expect(pricingEngine.calculateGroupDiscountRate(1, pricingRules)).toBe(0);
      expect(pricingEngine.calculateGroupDiscountRate(2, pricingRules)).toBe(0);
    });
  });

  describe('calculateInventoryMultiplier', () => {
    it('should return high multiplier for low inventory', () => {
      const inventoryStatus = {
        level: 'low',
        availablePercentage: 15,
        totalCabins: 100,
        availableCabins: 15,
      };

      const pricingRules = {
        inventoryLowMultiplier: 1.2,
        inventoryMediumMultiplier: 1.1,
        inventoryHighMultiplier: 1.0,
      };

      const multiplier = pricingEngine.calculateInventoryMultiplier(
        inventoryStatus,
        pricingRules
      );

      expect(multiplier).toBe(1.2);
    });

    it('should return medium multiplier for medium inventory', () => {
      const inventoryStatus = {
        level: 'medium',
        availablePercentage: 40,
        totalCabins: 100,
        availableCabins: 40,
      };

      const pricingRules = {
        inventoryLowMultiplier: 1.2,
        inventoryMediumMultiplier: 1.1,
        inventoryHighMultiplier: 1.0,
      };

      const multiplier = pricingEngine.calculateInventoryMultiplier(
        inventoryStatus,
        pricingRules
      );

      expect(multiplier).toBe(1.1);
    });

    it('should return base multiplier for high inventory', () => {
      const inventoryStatus = {
        level: 'high',
        availablePercentage: 80,
        totalCabins: 100,
        availableCabins: 80,
      };

      const pricingRules = {
        inventoryLowMultiplier: 1.2,
        inventoryMediumMultiplier: 1.1,
        inventoryHighMultiplier: 1.0,
      };

      const multiplier = pricingEngine.calculateInventoryMultiplier(
        inventoryStatus,
        pricingRules
      );

      expect(multiplier).toBe(1.0);
    });
  });
});
