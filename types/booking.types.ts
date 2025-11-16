// Booking Flow Types

export interface CruiseSearchParams {
  departurePort?: string;
  destinations?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  duration?: 'short' | 'medium' | 'long'; // 3-7일, 8-14일, 15일+
  priceMin?: number;
  priceMax?: number;
  adults?: number;
  children?: number;
}

export interface CruiseOption {
  id: string;
  name: string;
  shipName: string;
  description?: string;
  departureDate: Date | string;
  returnDate?: Date | string;
  durationDays: number;
  departurePort: string;
  destinations: string[];
  startingPrice: number;
  currency: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface CabinOption {
  id: string;
  category: 'inside' | 'oceanview' | 'balcony' | 'suite';
  name: string;
  description: string;
  size?: number; // sqm
  bedConfiguration?: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  features?: string[];
  amenities?: string[];
  recommended?: boolean;
  deckNumber?: number;
}

export interface Extra {
  id: string;
  category: 'beverage' | 'excursion' | 'connectivity' | 'spa' | 'dining';
  type?: 'beverage' | 'excursion' | 'internet' | 'spa' | 'dining';
  name: string;
  description: string;
  price: number;
  perDay?: boolean;
  quantity: number;
  imageUrl?: string;
  icon?: string;
}

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  passportNumber: string;
  nationality: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface PaymentInfo {
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface BookingDraft {
  // Step 1: Cruise Selection
  selectedCruise: CruiseOption | null;

  // Step 2: Cabin Selection
  selectedCabin: CabinOption | null;
  cabinNumber?: string;
  numCabins: number;

  // Step 3: Extras
  extras: Extra[];

  // Step 4: Passengers & Payment
  passengers: PassengerInfo[];
  payment: PaymentInfo | null;

  // Pricing
  basePrice: number;
  extrasTotal: number;
  promoCode?: string;
  promoDiscount: number;
  totalPrice: number;

  // Metadata
  currentStep: number;
  lastUpdated: Date;
  draftId?: string;
}

export interface PriceCalculation {
  basePrice: number;
  inventoryAdjustment: number;
  demandAdjustment: number;
  extrasTotal: number;
  promoDiscount: number;
  groupDiscount: number;
  subtotal: number;
  tax: number;
  total: number;
}
