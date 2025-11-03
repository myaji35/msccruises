// CRS/GDS API Types for Story 001

export interface CruiseAvailability {
  cruise_id: string;
  departure_date: string;
  availability: {
    inside: number;
    oceanview: number;
    balcony: number;
    suite: number;
  };
  pricing: {
    inside: PriceRange;
    oceanview: PriceRange;
    balcony: PriceRange;
    suite: PriceRange;
  };
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Passenger {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport: string;
  nationality: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface BookingRequest {
  cruise_id: string;
  cabin_category: "inside" | "oceanview" | "balcony" | "suite";
  passengers: Passenger[];
  contact: ContactInfo;
}

export interface BookingResponse {
  booking_id: string;
  confirmation_number: string;
  cruise_id: string;
  cabin_category: string;
  status: "pending" | "confirmed" | "failed";
  total_price: number;
  created_at: string;
}

export interface CruiseSearchParams {
  destination?: string;
  departure_date?: string;
  duration?: string;
  passengers?: number;
}

export interface Cruise {
  id: string;
  name: string;
  ship_name: string;
  departure_port: string;
  departure_date: string;
  return_date: string;
  duration_days: number;
  destinations: string[];
  starting_price: number;
  currency: string;
  image_url?: string;
}

export interface CrsApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

export interface CrsApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
