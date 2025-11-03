// CRS API Client Service - Story 001
// Mock implementation for Amadeus/Sabre API
// AC6: With Error Handling and Retry Logic

import type {
  CruiseAvailability,
  BookingRequest,
  BookingResponse,
  Cruise,
  CruiseSearchParams,
} from "@/types/cruise.types";
import {
  CRSError,
  CRSErrorCode,
  withRetryAndCircuitBreaker,
  logError,
} from "@/lib/crs-error-handler";

class CrsApiService {
  private baseUrl: string;
  private apiKey: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CRS_API_URL || "https://api.amadeus.com";
    this.apiKey = process.env.CRS_API_KEY || "mock_api_key";
  }

  // AC1: OAuth 2.0 Authentication with retry
  private async authenticate(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      // Mock authentication - replace with real Amadeus/Sabre OAuth
      const token = await withRetryAndCircuitBreaker(async () => {
        const response = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.apiKey,
            client_secret: process.env.CRS_API_SECRET || "",
          }),
        });

        if (!response.ok) {
          throw new CRSError(
            CRSErrorCode.AUTHENTICATION_FAILED,
            `Authentication failed: ${response.statusText}`,
            response.status,
            response.status >= 500
          );
        }

        const data = await response.json();
        return data.access_token;
      });

      this.accessToken = token;
      return token;
    } catch (error: any) {
      logError(error, { context: "CRS Authentication" });

      // Return mock token for development
      console.warn("[Development Mode] Using mock authentication token");
      this.accessToken = "mock_access_token";
      return this.accessToken;
    }
  }

  // AC2: Real-time Availability Check
  async getAvailability(cruiseId: string): Promise<CruiseAvailability> {
    const token = await this.authenticate();

    try {
      // Mock API call - replace with real CRS API
      // const response = await fetch(`${this.baseUrl}/v1/cruises/${cruiseId}/availability`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      // Mock response for development
      const mockData: CruiseAvailability = {
        cruise_id: cruiseId,
        departure_date: "2025-12-15",
        availability: {
          inside: 45,
          oceanview: 32,
          balcony: 18,
          suite: 5,
        },
        pricing: {
          inside: { min: 1299, max: 1599 },
          oceanview: { min: 1699, max: 1999 },
          balcony: { min: 2299, max: 2799 },
          suite: { min: 3999, max: 5999 },
        },
      };

      return mockData;
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      throw new Error("Failed to fetch cruise availability");
    }
  }

  // AC3: Create Booking
  async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    const token = await this.authenticate();

    try {
      // Mock API call - replace with real CRS API
      // const response = await fetch(`${this.baseUrl}/v1/bookings`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(bookingData),
      // });

      // Mock response for development
      const mockResponse: BookingResponse = {
        booking_id: `BK${Date.now()}`,
        confirmation_number: `MSC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        cruise_id: bookingData.cruise_id,
        cabin_category: bookingData.cabin_category,
        status: "confirmed",
        total_price: 2299,
        created_at: new Date().toISOString(),
      };

      return mockResponse;
    } catch (error) {
      console.error("Failed to create booking:", error);
      throw new Error("Failed to create booking");
    }
  }

  // Search cruises
  async searchCruises(params: CruiseSearchParams): Promise<Cruise[]> {
    const token = await this.authenticate();

    // Mock data for development
    const mockCruises: Cruise[] = [
      {
        id: "MSC123456",
        name: "Caribbean Adventure",
        ship_name: "MSC Seaside",
        departure_port: "Miami, FL",
        departure_date: "2025-12-15",
        return_date: "2025-12-22",
        duration_days: 7,
        destinations: ["Cozumel", "Jamaica", "Bahamas"],
        starting_price: 1299,
        currency: "USD",
        image_url: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800",
      },
      {
        id: "MSC123457",
        name: "Mediterranean Explorer",
        ship_name: "MSC Meraviglia",
        departure_port: "Barcelona, Spain",
        departure_date: "2025-07-10",
        return_date: "2025-07-20",
        duration_days: 10,
        destinations: ["Rome", "Athens", "Santorini"],
        starting_price: 1899,
        currency: "USD",
        image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      },
      {
        id: "MSC123458",
        name: "Northern Fjords",
        ship_name: "MSC Divina",
        departure_port: "Copenhagen, Denmark",
        departure_date: "2025-08-05",
        return_date: "2025-08-17",
        duration_days: 12,
        destinations: ["Norwegian Fjords", "Stockholm"],
        starting_price: 2499,
        currency: "USD",
        image_url: "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=800",
      },
    ];

    return mockCruises;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const crsApiService = new CrsApiService();
