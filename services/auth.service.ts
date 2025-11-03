// Authentication Service - Mock implementation
// Will integrate with Auth0/Okta or custom backend in production

import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Booking,
  BookingHistory,
  PartnerStats,
  PartnerBooking,
} from "@/types/auth.types";

class AuthService {
  private storageKey = "msc_auth_token";
  private userKey = "msc_user";

  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock validation
    if (credentials.email && credentials.password) {
      const mockUser: User = {
        id: "USR123456",
        email: credentials.email,
        name: "홍길동",
        phone: "010-1234-5678",
        user_type: credentials.email.includes("partner") ? "partner" : "customer",
        created_at: new Date().toISOString(),
      };

      // Add partner info if partner account
      if (mockUser.user_type === "partner") {
        mockUser.partner_info = {
          company_name: "서울크루즈여행사",
          business_number: "123-45-67890",
          representative_name: "홍길동",
          address: "서울시 강남구 테헤란로 123",
          commission_rate: 0.1, // 10%
          subpage_url: "/partners/seoul-cruise",
          status: "active",
          approved_at: "2025-01-01T00:00:00Z",
        };
      } else {
        // Add Voyagers Club for customer
        mockUser.voyagers_club = {
          membership_number: "MSC123456789",
          tier: "silver",
          points: 12500,
          joined_at: "2024-01-01T00:00:00Z",
        };
      }

      const response: AuthResponse = {
        user: mockUser,
        token: `mock_token_${Date.now()}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(this.storageKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
      }

      return response;
    }

    throw new Error("Invalid credentials");
  }

  // Register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Create new user
    const newUser: User = {
      id: `USR${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone,
      user_type: data.user_type,
      created_at: new Date().toISOString(),
    };

    // Add partner info if registering as partner
    if (data.user_type === "partner" && data.partner_info) {
      newUser.partner_info = {
        company_name: data.partner_info.company_name || "",
        business_number: data.partner_info.business_number || "",
        representative_name: data.partner_info.representative_name || data.name,
        address: data.partner_info.address || "",
        commission_rate: 0.08, // Default 8%
        subpage_url: this.generatePartnerUrl(data.partner_info.company_name || ""),
        status: "pending", // Requires admin approval
      };
    } else {
      // Auto-enroll in Voyagers Club for customers
      newUser.voyagers_club = {
        membership_number: `MSC${Date.now()}`,
        tier: "classic",
        points: 0,
        joined_at: new Date().toISOString(),
      };
    }

    const response: AuthResponse = {
      user: newUser,
      token: `mock_token_${Date.now()}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
    }

    return response;
  }

  // Logout
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userKey);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.userKey);
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
    return null;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(this.storageKey);
      return !!token;
    }
    return false;
  }

  // Get booking history for customer
  async getBookingHistory(userId: string): Promise<BookingHistory> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockBookings: Booking[] = [
      {
        id: "BK123456",
        user_id: userId,
        booking_number: "MSC2025001234",
        cruise_id: "MSC123456",
        cruise_name: "Caribbean Adventure",
        ship_name: "MSC Seaside",
        departure_date: "2025-12-15",
        return_date: "2025-12-22",
        departure_port: "Miami, FL",
        cabin_category: "balcony",
        cabin_number: "B-1234",
        passengers: [
          {
            first_name: "길동",
            last_name: "홍",
            date_of_birth: "1985-03-15",
            nationality: "KR",
            is_primary: true,
          },
          {
            first_name: "영희",
            last_name: "김",
            date_of_birth: "1987-07-20",
            nationality: "KR",
            is_primary: false,
          },
        ],
        total_price: 4598,
        currency: "USD",
        status: "confirmed",
        payment_status: "paid",
        created_at: "2025-01-15T10:30:00Z",
        package_info: {
          outbound_flight: "KE081",
          return_flight: "KE082",
          package_discount: 350,
        },
      },
      {
        id: "BK123457",
        user_id: userId,
        booking_number: "MSC2024009876",
        cruise_id: "MSC123457",
        cruise_name: "Mediterranean Explorer",
        ship_name: "MSC Meraviglia",
        departure_date: "2024-07-10",
        return_date: "2024-07-20",
        departure_port: "Barcelona, Spain",
        cabin_category: "suite",
        cabin_number: "S-567",
        passengers: [
          {
            first_name: "길동",
            last_name: "홍",
            date_of_birth: "1985-03-15",
            nationality: "KR",
            is_primary: true,
          },
        ],
        total_price: 5999,
        currency: "USD",
        status: "completed",
        payment_status: "paid",
        created_at: "2024-05-20T14:22:00Z",
      },
    ];

    return {
      bookings: mockBookings,
      total_spent: mockBookings.reduce((sum, b) => sum + b.total_price, 0),
      voyagers_club_points_earned: 10598, // Points based on total spent
    };
  }

  // Get partner stats
  async getPartnerStats(partnerId: string): Promise<PartnerStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      partner_id: partnerId,
      total_bookings: 45,
      total_revenue: 125000,
      total_commission: 12500,
      active_bookings: 12,
      this_month_bookings: 8,
      this_month_revenue: 28000,
      top_selling_cruises: [
        {
          cruise_name: "Caribbean Adventure",
          bookings_count: 15,
          revenue: 45000,
        },
        {
          cruise_name: "Mediterranean Explorer",
          bookings_count: 12,
          revenue: 38000,
        },
        {
          cruise_name: "Northern Fjords",
          bookings_count: 8,
          revenue: 24000,
        },
      ],
    };
  }

  // Get partner bookings
  async getPartnerBookings(partnerId: string): Promise<PartnerBooking[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      {
        id: "BK789012",
        user_id: "USR456789",
        booking_number: "MSC2025002345",
        cruise_id: "MSC123456",
        cruise_name: "Caribbean Adventure",
        ship_name: "MSC Seaside",
        departure_date: "2025-12-15",
        return_date: "2025-12-22",
        departure_port: "Miami, FL",
        cabin_category: "oceanview",
        passengers: [
          {
            first_name: "철수",
            last_name: "김",
            date_of_birth: "1990-05-10",
            nationality: "KR",
            is_primary: true,
          },
        ],
        total_price: 2999,
        currency: "USD",
        status: "confirmed",
        payment_status: "paid",
        created_at: "2025-01-20T11:15:00Z",
        partner_id: partnerId,
        partner_commission: 299.9,
        customer_email: "kim@example.com",
        customer_name: "김철수",
        customer_phone: "010-9876-5432",
        commission_amount: 299.9,
        commission_status: "approved",
      },
    ];
  }

  // Generate partner subpage URL
  private generatePartnerUrl(companyName: string): string {
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return `/partners/${slug}`;
  }
}

// Singleton instance
export const authService = new AuthService();
