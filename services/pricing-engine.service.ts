import { PrismaClient } from '@prisma/client';
import type {
  PriceParams,
  Price,
  PriceBreakdown,
  InventoryStatus,
  DemandScore,
  PromotionValidation,
} from '@/types/pricing.types';

const prisma = new PrismaClient();

/**
 * PricingEngine - 동적 가격 책정 엔진
 *
 * 재고, 수요, 프로모션, 그룹 할인을 고려한 실시간 가격 계산
 */
export class PricingEngine {
  /**
   * 최종 가격 계산 (메인 메서드)
   */
  async calculatePrice(params: PriceParams): Promise<Price> {
    const {
      cruiseId,
      cabinCategory,
      numCabins = 1,
      promoCode,
      departureDate,
    } = params;

    // 1. Get base price
    let currentPrice = await this.getBasePrice(cruiseId, cabinCategory);
    const appliedRules: string[] = [];
    const breakdown: PriceBreakdown = {
      base: currentPrice,
      inventoryAdjustment: 0,
      demandAdjustment: 0,
      promotionDiscount: 0,
      groupDiscount: 0,
    };

    // 2. Get active pricing rules
    const pricingRules = await this.getActivePricingRules(cruiseId, cabinCategory);

    if (!pricingRules) {
      // Use default rules if no custom rules found
      return this.applyDefaultPricing(params, currentPrice, breakdown, appliedRules);
    }

    // 3. Apply inventory-based adjustment
    const inventoryStatus = await this.getInventoryStatus(cruiseId, cabinCategory);
    const inventoryMultiplier = this.calculateInventoryMultiplier(
      inventoryStatus,
      pricingRules
    );

    if (inventoryMultiplier !== 1.0) {
      const adjustment = currentPrice * (inventoryMultiplier - 1);
      breakdown.inventoryAdjustment = adjustment;
      currentPrice *= inventoryMultiplier;
      appliedRules.push(`inventory_${inventoryStatus.level}`);
    }

    // 4. Apply demand-based adjustment
    if (departureDate) {
      const demandScore = await this.calculateDemandScore(cruiseId, departureDate);
      const demandMultiplier = this.getDemandMultiplier(demandScore, pricingRules);

      if (demandMultiplier !== 1.0) {
        const adjustment = currentPrice * (demandMultiplier - 1);
        breakdown.demandAdjustment = adjustment;
        currentPrice *= demandMultiplier;
        appliedRules.push(`demand_${demandScore.level}`);
      }
    }

    // 5. Apply promotion code
    if (promoCode) {
      const promoValidation = await this.validatePromoCode(
        promoCode,
        cruiseId,
        cabinCategory,
        currentPrice
      );

      if (promoValidation.isValid && promoValidation.discountAmount) {
        breakdown.promotionDiscount = promoValidation.discountAmount;
        currentPrice -= promoValidation.discountAmount;
        appliedRules.push(`promo_${promoCode}`);
      }
    }

    // 6. Apply group discount
    if (numCabins >= 3) {
      const groupDiscountRate = this.calculateGroupDiscountRate(numCabins, pricingRules);
      const groupDiscountAmount = currentPrice * groupDiscountRate;

      breakdown.groupDiscount = groupDiscountAmount;
      currentPrice -= groupDiscountAmount;
      appliedRules.push(`group_${numCabins}cabins`);
    }

    // 7. Log price change if significant
    await this.logPriceChange(
      cruiseId,
      cabinCategory,
      breakdown.base,
      currentPrice,
      appliedRules
    );

    return {
      finalPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimals
      currency: 'USD',
      breakdown,
      appliedRules,
    };
  }

  /**
   * Get base price from cruise data
   */
  private async getBasePrice(cruiseId: string, cabinCategory: string): Promise<number> {
    const cruise = await prisma.cruise.findUnique({
      where: { id: cruiseId },
      select: { startingPrice: true },
    });

    if (!cruise) {
      throw new Error(`Cruise not found: ${cruiseId}`);
    }

    // Apply category multiplier from DB
    const category = await prisma.cabinCategory.findUnique({
      where: { code: cabinCategory },
    });

    const multiplier = category?.priceMultiplier || 1.0;
    return cruise.startingPrice * multiplier;
  }

  /**
   * Get active pricing rules for cruise/category
   */
  private async getActivePricingRules(cruiseId: string, cabinCategory: string) {
    const rules = await prisma.pricingRule.findFirst({
      where: {
        isActive: true,
        OR: [
          { applicableCruises: null }, // Global rule
          { applicableCruises: { contains: cruiseId } },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    return rules;
  }

  /**
   * Get inventory status (mock implementation)
   * In production, this would call the CRS API
   */
  private async getInventoryStatus(
    cruiseId: string,
    cabinCategory: string
  ): Promise<InventoryStatus> {
    // Mock data - in production, call CRS API
    const mockInventory = {
      total: 100,
      available: Math.floor(Math.random() * 100),
    };

    const percentageAvailable = (mockInventory.available / mockInventory.total) * 100;

    let level: 'low' | 'medium' | 'high';
    if (percentageAvailable < 30) level = 'low';
    else if (percentageAvailable < 70) level = 'medium';
    else level = 'high';

    return {
      ...mockInventory,
      percentageAvailable,
      level,
      multiplier: 1.0, // Will be calculated separately
    };
  }

  /**
   * Calculate inventory-based price multiplier
   */
  private calculateInventoryMultiplier(
    inventory: InventoryStatus,
    rules: any
  ): number {
    const { percentageAvailable } = inventory;

    if (percentageAvailable < (rules?.inventoryThresholdLow || 30)) {
      return rules?.priceMultiplierLow || 1.20; // +20%
    } else if (percentageAvailable < (rules?.inventoryThresholdMedium || 50)) {
      return rules?.priceMultiplierMedium || 1.10; // +10%
    } else if (percentageAvailable < (rules?.inventoryThresholdHigh || 70)) {
      return rules?.priceMultiplierHigh || 1.05; // +5%
    }

    return 1.0; // No adjustment
  }

  /**
   * Calculate demand score based on various factors
   */
  private async calculateDemandScore(
    cruiseId: string,
    departureDate: Date
  ): Promise<DemandScore> {
    const now = new Date();
    const daysUntilDeparture = Math.floor(
      (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Factor 1: Days until departure (0-30 points)
    let daysScore = 0;
    if (daysUntilDeparture < 30) daysScore = 30;
    else if (daysUntilDeparture < 60) daysScore = 20;
    else if (daysUntilDeparture < 90) daysScore = 10;

    // Factor 2: Seasonality (0-30 points)
    const month = departureDate.getMonth();
    const isSummerSeason = month >= 5 && month <= 8; // June-September
    const isWinterHoliday = month === 11 || month === 0; // December-January
    const seasonScore = isSummerSeason || isWinterHoliday ? 30 : 10;

    // Factor 3: Weekday vs Weekend (0-20 points)
    const dayOfWeek = departureDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekdayScore = isWeekend ? 20 : 0;

    // Factor 4: Historical booking data (0-20 points)
    const historicalScore = await this.getHistoricalDemandScore(cruiseId);

    // Total score (0-100)
    const totalScore = daysScore + seasonScore + weekdayScore + historicalScore;

    let level: 'low' | 'medium' | 'high';
    if (totalScore >= 70) level = 'high';
    else if (totalScore >= 40) level = 'medium';
    else level = 'low';

    return {
      score: totalScore,
      level,
      multiplier: 1.0, // Will be calculated separately
      factors: {
        daysUntilDeparture: daysScore,
        seasonality: seasonScore,
        weekday: weekdayScore,
        events: historicalScore,
      },
    };
  }

  /**
   * Get historical demand score from past bookings
   */
  private async getHistoricalDemandScore(cruiseId: string): Promise<number> {
    // Count bookings in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await prisma.booking.count({
      where: {
        cruiseId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Convert to score (0-20)
    if (recentBookings >= 50) return 20;
    if (recentBookings >= 30) return 15;
    if (recentBookings >= 10) return 10;
    return 5;
  }

  /**
   * Get demand-based price multiplier
   */
  private getDemandMultiplier(demand: DemandScore, rules: any): number {
    switch (demand.level) {
      case 'high':
        return rules?.demandMultiplierHigh || 1.15; // +15%
      case 'medium':
        return rules?.demandMultiplierMedium || 1.07; // +7%
      default:
        return rules?.demandMultiplierLow || 1.0; // No change
    }
  }

  /**
   * Validate and calculate promotion discount
   */
  private async validatePromoCode(
    code: string,
    cruiseId: string,
    cabinCategory: string,
    currentPrice: number
  ): Promise<PromotionValidation> {
    const promo = await prisma.promotionCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return { isValid: false, message: 'Invalid promotion code' };
    }

    const now = new Date();

    // Check validity period
    if (now < promo.validFrom || now > promo.validUntil) {
      return { isValid: false, message: 'Promotion code has expired' };
    }

    // Check if active
    if (!promo.isActive) {
      return { isValid: false, message: 'Promotion code is not active' };
    }

    // Check usage limit
    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return { isValid: false, message: 'Promotion code usage limit reached' };
    }

    // Check minimum order amount
    if (promo.minOrderAmount && currentPrice < promo.minOrderAmount) {
      return {
        isValid: false,
        message: `Minimum order amount of $${promo.minOrderAmount} required`,
      };
    }

    // Check applicable cruises
    if (promo.applicableCruises) {
      const applicableCruisesList = JSON.parse(promo.applicableCruises);
      if (!applicableCruisesList.includes(cruiseId)) {
        return { isValid: false, message: 'Promotion not applicable to this cruise' };
      }
    }

    // Check applicable categories
    if (promo.applicableCategories) {
      const applicableCategoriesList = JSON.parse(promo.applicableCategories);
      if (!applicableCategoriesList.includes(cabinCategory)) {
        return { isValid: false, message: 'Promotion not applicable to this cabin category' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.type === 'percentage') {
      discountAmount = currentPrice * (promo.value / 100);
    } else if (promo.type === 'fixed') {
      discountAmount = promo.value;
    }

    return {
      isValid: true,
      code: promo.code,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  }

  /**
   * Calculate group discount rate
   */
  private calculateGroupDiscountRate(numCabins: number, rules: any): number {
    if (numCabins >= 11) {
      return rules?.groupDiscount11plus || 0.15; // 15%
    } else if (numCabins >= 6) {
      return rules?.groupDiscount6to10 || 0.10; // 10%
    } else if (numCabins >= 3) {
      return rules?.groupDiscount3to5 || 0.05; // 5%
    }
    return 0;
  }

  /**
   * Log significant price changes
   */
  private async logPriceChange(
    cruiseId: string,
    cabinCategory: string,
    oldPrice: number,
    newPrice: number,
    appliedRules: string[]
  ): Promise<void> {
    const priceChange = Math.abs(newPrice - oldPrice);
    const changePercentage = (priceChange / oldPrice) * 100;

    // Only log if change is > 5%
    if (changePercentage < 5) return;

    const changeReason = appliedRules.includes('inventory_low')
      ? 'inventory'
      : appliedRules.some((r) => r.startsWith('demand_'))
      ? 'demand'
      : appliedRules.some((r) => r.startsWith('promo_'))
      ? 'promotion'
      : 'manual';

    await prisma.priceHistory.create({
      data: {
        cruiseId,
        cabinCategory,
        oldPrice,
        newPrice,
        changeReason,
        changeDetails: JSON.stringify({ appliedRules }),
        changedBy: 'system',
      },
    });
  }

  /**
   * Apply default pricing when no custom rules exist
   */
  private async applyDefaultPricing(
    params: PriceParams,
    basePrice: number,
    breakdown: PriceBreakdown,
    appliedRules: string[]
  ): Promise<Price> {
    let currentPrice = basePrice;

    // Simple inventory check (mock)
    const inventoryStatus = await this.getInventoryStatus(params.cruiseId, params.cabinCategory);
    if (inventoryStatus.level === 'low') {
      const adjustment = currentPrice * 0.20;
      breakdown.inventoryAdjustment = adjustment;
      currentPrice += adjustment;
      appliedRules.push('inventory_low_default');
    }

    // Group discount
    if (params.numCabins && params.numCabins >= 3) {
      const rate = this.calculateGroupDiscountRate(params.numCabins, null);
      const discount = currentPrice * rate;
      breakdown.groupDiscount = discount;
      currentPrice -= discount;
      appliedRules.push(`group_${params.numCabins}cabins_default`);
    }

    return {
      finalPrice: Math.round(currentPrice * 100) / 100,
      currency: 'USD',
      breakdown,
      appliedRules,
    };
  }

  /**
   * Increment promotion code usage
   */
  async incrementPromoCodeUsage(code: string): Promise<void> {
    await prisma.promotionCode.update({
      where: { code: code.toUpperCase() },
      data: { currentUses: { increment: 1 } },
    });
  }
}

// Export singleton instance
export const pricingEngine = new PricingEngine();
