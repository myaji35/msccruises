// Flight API Service - Mock implementation
// Will integrate with Amadeus/Sabre Flight API in production

import type {
  Flight,
  FlightSearchParams,
  Airport,
  FlightSegment,
  KOREAN_AIRPORTS,
  CRUISE_PORT_AIRPORTS,
} from "@/types/flight.types";

class FlightApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FLIGHT_API_URL || "https://api.amadeus.com";
    this.apiKey = process.env.FLIGHT_API_KEY || "mock_flight_api_key";
  }

  // Search flights
  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    // Mock flight data for development
    const mockFlights: Flight[] = this.generateMockFlights(params);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockFlights;
  }

  // Generate realistic mock flight data
  private generateMockFlights(params: FlightSearchParams): Flight[] {
    const flights: Flight[] = [];
    const { origin, destination, departure_date, passengers, cabin_class = "economy" } = params;

    // Korean airlines
    const airlines = [
      { code: "KE", name: "대한항공", multiplier: 1.2 },
      { code: "OZ", name: "아시아나항공", multiplier: 1.15 },
      { code: "7C", name: "제주항공", multiplier: 0.85 },
      { code: "TW", name: "티웨이항공", multiplier: 0.8 },
      { code: "LJ", name: "진에어", multiplier: 0.82 },
    ];

    // Calculate base price based on destination
    let basePrice = 800; // Default for short-haul

    // Adjust price by destination (rough estimates for Korea → cruise ports)
    const destinationPricing: Record<string, number> = {
      "MIA": 1200, // Miami
      "BCN": 1000, // Barcelona
      "CPH": 950,  // Copenhagen
      "FCO": 900,  // Rome
    };

    basePrice = destinationPricing[destination] || 800;

    // Cabin class multipliers
    const cabinMultipliers = {
      economy: 1,
      premium_economy: 1.5,
      business: 3,
      first: 5,
    };

    // Generate flights for each airline
    airlines.forEach((airline, index) => {
      // Direct flight
      if (params.max_stops === undefined || params.max_stops >= 0) {
        const directFlight = this.createMockFlight({
          id: `${airline.code}-DIR-${index}`,
          origin,
          destination,
          departure_date,
          airline,
          stops: 0,
          basePrice: basePrice * airline.multiplier * cabinMultipliers[cabin_class],
          cabin_class,
        });
        flights.push(directFlight);
      }

      // 1-stop flight (cheaper)
      if (params.max_stops === undefined || params.max_stops >= 1) {
        const oneStopFlight = this.createMockFlight({
          id: `${airline.code}-1ST-${index}`,
          origin,
          destination,
          departure_date,
          airline,
          stops: 1,
          basePrice: basePrice * 0.75 * airline.multiplier * cabinMultipliers[cabin_class],
          cabin_class,
        });
        flights.push(oneStopFlight);
      }
    });

    // Sort by price (ascending)
    return flights.sort((a, b) => a.price - b.price);
  }

  private createMockFlight(config: {
    id: string;
    origin: string;
    destination: string;
    departure_date: string;
    airline: { code: string; name: string };
    stops: number;
    basePrice: number;
    cabin_class: "economy" | "premium_economy" | "business" | "first";
  }): Flight {
    const { id, origin, destination, departure_date, airline, stops, basePrice, cabin_class } = config;

    // Create segments
    const segments: FlightSegment[] = [];
    const departureTime = new Date(departure_date);
    departureTime.setHours(10 + Math.floor(Math.random() * 12)); // Random departure 10:00-22:00

    if (stops === 0) {
      // Direct flight
      const duration = 600 + Math.floor(Math.random() * 300); // 10-15 hours
      const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

      segments.push({
        departure_airport: this.getAirportInfo(origin),
        arrival_airport: this.getAirportInfo(destination),
        departure_time: departureTime.toISOString(),
        arrival_time: arrivalTime.toISOString(),
        flight_number: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
        airline: airline.name,
        airline_code: airline.code,
        duration_minutes: duration,
        aircraft_type: "Boeing 777-300ER",
      });
    } else {
      // 1-stop flight via common hub
      const hubs = ["NRT", "PVG", "HKG", "SIN"]; // Tokyo, Shanghai, Hong Kong, Singapore
      const hubCode = hubs[Math.floor(Math.random() * hubs.length)];

      // First segment
      const firstDuration = 200 + Math.floor(Math.random() * 100); // 3-5 hours
      const firstArrival = new Date(departureTime.getTime() + firstDuration * 60000);

      segments.push({
        departure_airport: this.getAirportInfo(origin),
        arrival_airport: this.getAirportInfo(hubCode),
        departure_time: departureTime.toISOString(),
        arrival_time: firstArrival.toISOString(),
        flight_number: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
        airline: airline.name,
        airline_code: airline.code,
        duration_minutes: firstDuration,
        aircraft_type: "Airbus A350-900",
      });

      // Layover 2-4 hours
      const layoverMinutes = 120 + Math.floor(Math.random() * 120);
      const secondDeparture = new Date(firstArrival.getTime() + layoverMinutes * 60000);

      // Second segment
      const secondDuration = 600 + Math.floor(Math.random() * 200); // 10-13 hours
      const secondArrival = new Date(secondDeparture.getTime() + secondDuration * 60000);

      segments.push({
        departure_airport: this.getAirportInfo(hubCode),
        arrival_airport: this.getAirportInfo(destination),
        departure_time: secondDeparture.toISOString(),
        arrival_time: secondArrival.toISOString(),
        flight_number: `${airline.code}${Math.floor(Math.random() * 900) + 100}`,
        airline: airline.name,
        airline_code: airline.code,
        duration_minutes: secondDuration,
        aircraft_type: "Boeing 787-9",
      });
    }

    const totalDuration = segments.reduce((sum, seg) => {
      const depTime = new Date(seg.departure_time).getTime();
      const arrTime = new Date(seg.arrival_time).getTime();
      return sum + (arrTime - depTime) / 60000;
    }, 0);

    return {
      id,
      type: "outbound",
      segments,
      total_duration_minutes: Math.floor(totalDuration),
      stops,
      price: Math.floor(basePrice + Math.random() * 100), // Add some variance
      currency: "USD",
      cabin_class,
      available_seats: Math.floor(Math.random() * 20) + 5, // 5-25 seats
    };
  }

  private getAirportInfo(code: string): Airport {
    // Mock airport database
    const airports: Record<string, Airport> = {
      ICN: { code: "ICN", name: "인천국제공항", city: "Seoul", country: "South Korea" },
      GMP: { code: "GMP", name: "김포국제공항", city: "Seoul", country: "South Korea" },
      PUS: { code: "PUS", name: "김해국제공항", city: "Busan", country: "South Korea" },
      MIA: { code: "MIA", name: "Miami International Airport", city: "Miami", country: "USA" },
      BCN: { code: "BCN", name: "Barcelona El Prat Airport", city: "Barcelona", country: "Spain" },
      CPH: { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
      FCO: { code: "FCO", name: "Leonardo da Vinci Airport", city: "Rome", country: "Italy" },
      NRT: { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
      PVG: { code: "PVG", name: "Pudong International Airport", city: "Shanghai", country: "China" },
      HKG: { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
      SIN: { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
    };

    return airports[code] || {
      code,
      name: `${code} Airport`,
      city: "Unknown",
      country: "Unknown",
    };
  }

  // Format duration for display
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  }

  // Format time for display
  formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}

// Singleton instance
export const flightApiService = new FlightApiService();
