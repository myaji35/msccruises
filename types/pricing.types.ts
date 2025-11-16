// Pricing Engine Types

export interface PriceParams {
  cruiseId: string;
  cabinCategory: string;
  numCabins?: number;
  promoCode?: string;
  departureDate?: Date;
}

export interface PriceBreakdown {
  base: number;
  inventoryAdjustment: number;
  demandAdjustment: number;
  promotionDiscount: number;
  groupDiscount: number;
}

export interface Price {
  finalPrice: number;
  currency: string;
  breakdown: PriceBreakdown;
  appliedRules: string[];
}

export interface PromotionValidation {
  isValid: boolean;
  code?: string;
  discountAmount?: number;
  message?: string;
}

export interface DemandScore {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high';
  multiplier: number;
  factors: {
    daysUntilDeparture?: number;
    seasonality?: number;
    weekday?: number;
    events?: number;
  };
}

export interface InventoryStatus {
  total: number;
  available: number;
  percentageAvailable: number;
  level: 'low' | 'medium' | 'high';
  multiplier: number;
}
