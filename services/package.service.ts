// Cruise + Flight Package Service
// Combines cruise and flight data to create integrated packages

import { crsApiService } from "./crs-api.service";
import { flightApiService } from "./flight-api.service";
import type { Cruise } from "@/types/cruise.types";
import type { Flight, FlightSearchParams, CRUISE_PORT_AIRPORTS } from "@/types/flight.types";
import type { CruiseFlightPackage, PackageSearchParams } from "@/types/flight.types";

class PackageService {
  // Search for cruise + flight packages
  async searchPackages(params: PackageSearchParams): Promise<CruiseFlightPackage[]> {
    try {
      // 1. Search cruises
      const cruises = await crsApiService.searchCruises({
        destination: params.cruise_destination,
        departure_date: params.cruise_departure_date,
        duration: params.cruise_duration,
        passengers: params.passengers,
      });

      // 2. For each cruise, find matching flights
      const packages: CruiseFlightPackage[] = [];

      for (const cruise of cruises) {
        // Get airport code for cruise departure port
        const destinationAirport = this.getAirportForPort(cruise.departure_port);

        if (!destinationAirport) {
          console.warn(`No airport found for port: ${cruise.departure_port}`);
          continue;
        }

        // Search outbound flights (Korea → Cruise Port)
        const outboundParams: FlightSearchParams = {
          origin: params.departure_airport,
          destination: destinationAirport,
          departure_date: this.getDaysBeforeCruise(cruise.departure_date, 1), // Arrive 1 day before
          passengers: params.passengers,
          cabin_class: params.cabin_class,
          max_stops: params.max_stops,
        };

        const outboundFlights = await flightApiService.searchFlights(outboundParams);

        // Search return flights (Cruise Port → Korea)
        const returnParams: FlightSearchParams = {
          origin: destinationAirport,
          destination: params.departure_airport,
          departure_date: this.getDaysAfterCruise(cruise.return_date, 1), // Leave 1 day after
          passengers: params.passengers,
          cabin_class: params.cabin_class,
          max_stops: params.max_stops,
        };

        const returnFlights = await flightApiService.searchFlights(returnParams);

        // Create packages by combining best flights (cheapest for each stop count)
        const bestOutbound = this.selectBestFlights(outboundFlights, 2);
        const bestReturn = this.selectBestFlights(returnFlights, 2);

        // Combine flights to create packages
        for (const outbound of bestOutbound) {
          for (const returnFlight of bestReturn) {
            const pkg = this.createPackage(cruise, outbound, returnFlight);
            packages.push(pkg);
          }
        }
      }

      // Sort packages by total price
      return packages.sort((a, b) => a.pricing.total_price - b.pricing.total_price);
    } catch (error) {
      console.error("Failed to search packages:", error);
      throw new Error("패키지 검색에 실패했습니다.");
    }
  }

  // Create a package from cruise + flights
  private createPackage(
    cruise: Cruise,
    outboundFlight: Flight,
    returnFlight: Flight
  ): CruiseFlightPackage {
    const cruisePrice = cruise.starting_price;
    const flightPrice = outboundFlight.price + returnFlight.price;

    // Calculate package discount (5-10% off when booking together)
    const discountPercentage = 0.07; // 7% package discount
    const subtotal = cruisePrice + flightPrice;
    const discount = Math.floor(subtotal * discountPercentage);
    const totalPrice = subtotal - discount;

    return {
      id: `PKG-${cruise.id}-${outboundFlight.id}-${returnFlight.id}`,
      cruise: {
        id: cruise.id,
        name: cruise.name,
        ship_name: cruise.ship_name,
        departure_port: cruise.departure_port,
        departure_date: cruise.departure_date,
        return_date: cruise.return_date,
        duration_days: cruise.duration_days,
        destinations: cruise.destinations,
        cruise_price: cruisePrice,
        image_url: cruise.image_url,
      },
      flights: {
        outbound: outboundFlight,
        return: returnFlight,
      },
      pricing: {
        cruise_price: cruisePrice,
        flight_price: flightPrice,
        total_price: totalPrice,
        discount,
        currency: "USD",
      },
      package_benefits: [
        "무료 공항 픽업 서비스",
        "사전 온라인 체크인",
        "패키지 할인 7% 적용",
        "24시간 한국어 고객센터",
      ],
    };
  }

  // Get airport code for cruise port
  private getAirportForPort(port: string): string | null {
    const portAirportMap: Record<string, string> = {
      "Miami, FL": "MIA",
      "Barcelona, Spain": "BCN",
      "Copenhagen, Denmark": "CPH",
      "Rome, Italy": "FCO",
    };

    return portAirportMap[port] || null;
  }

  // Calculate date N days before cruise departure
  private getDaysBeforeCruise(cruiseDate: string, days: number): string {
    const date = new Date(cruiseDate);
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  }

  // Calculate date N days after cruise return
  private getDaysAfterCruise(returnDate: string, days: number): string {
    const date = new Date(returnDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  // Select best flights (diversify by stops and price)
  private selectBestFlights(flights: Flight[], count: number): Flight[] {
    if (flights.length === 0) return [];

    const selected: Flight[] = [];

    // First, get cheapest direct flight if available
    const directFlights = flights.filter((f) => f.stops === 0);
    if (directFlights.length > 0) {
      selected.push(directFlights[0]); // Already sorted by price
    }

    // Then get cheapest 1-stop flight
    const oneStopFlights = flights.filter((f) => f.stops === 1);
    if (oneStopFlights.length > 0 && selected.length < count) {
      selected.push(oneStopFlights[0]);
    }

    // Fill remaining slots with next cheapest options
    while (selected.length < count && selected.length < flights.length) {
      const nextFlight = flights.find((f) => !selected.includes(f));
      if (nextFlight) {
        selected.push(nextFlight);
      } else {
        break;
      }
    }

    return selected;
  }

  // Format package price for display
  formatPackagePrice(pkg: CruiseFlightPackage): string {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: pkg.pricing.currency,
    }).format(pkg.pricing.total_price);
  }

  // Calculate savings
  getSavings(pkg: CruiseFlightPackage): number {
    return pkg.pricing.discount || 0;
  }
}

// Singleton instance
export const packageService = new PackageService();
