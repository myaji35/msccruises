// Authentication and User Types

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  user_type: "customer" | "partner"; // customer: 일반회원, partner: 회원사(대리점)
  partner_info?: PartnerInfo;
  created_at: string;
  voyagers_club?: VoyagersClubMembership;
}

export interface PartnerInfo {
  company_name: string;
  business_number: string; // 사업자등록번호
  representative_name: string; // 대표자명
  address: string;
  commission_rate: number; // 수수료율 (e.g., 0.1 = 10%)
  subpage_url: string; // 전용 서브페이지 URL (e.g., /partners/seoul-travel)
  status: "active" | "pending" | "suspended";
  approved_at?: string;
}

export interface VoyagersClubMembership {
  membership_number: string;
  tier: "classic" | "silver" | "gold" | "black"; // MSC Voyagers Club tiers
  points: number;
  joined_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  user_type: "customer" | "partner";
  partner_info?: Partial<PartnerInfo>;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  booking_number: string;
  cruise_id: string;
  cruise_name: string;
  ship_name: string;
  departure_date: string;
  return_date: string;
  departure_port: string;
  cabin_category: string;
  cabin_number?: string;
  passengers: PassengerInfo[];
  total_price: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded";
  created_at: string;

  // Package info if booked as package
  package_info?: {
    outbound_flight: string; // Flight number
    return_flight: string;
    package_discount: number;
  };

  // For partner bookings
  partner_id?: string;
  partner_commission?: number;
}

export interface PassengerInfo {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number?: string;
  nationality: string;
  is_primary: boolean; // Primary contact
}

export interface BookingHistory {
  bookings: Booking[];
  total_spent: number;
  voyagers_club_points_earned: number;
}

// Partner-specific types
export interface PartnerStats {
  partner_id: string;
  total_bookings: number;
  total_revenue: number;
  total_commission: number;
  active_bookings: number;
  this_month_bookings: number;
  this_month_revenue: number;
  top_selling_cruises: {
    cruise_name: string;
    bookings_count: number;
    revenue: number;
  }[];
}

export interface PartnerBooking extends Booking {
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  commission_amount: number;
  commission_status: "pending" | "approved" | "paid";
}
