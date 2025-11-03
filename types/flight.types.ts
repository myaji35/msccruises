// Flight API Types for Cruise + Flight Package Integration

export interface Airport {
  code: string; // IATA code (e.g., ICN, GMP, PUS)
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  departure_airport: Airport;
  arrival_airport: Airport;
  departure_time: string; // ISO 8601
  arrival_time: string; // ISO 8601
  flight_number: string;
  airline: string;
  airline_code: string; // IATA airline code
  duration_minutes: number;
  aircraft_type?: string;
}

export interface Flight {
  id: string;
  type: "outbound" | "return";
  segments: FlightSegment[]; // Multiple segments for connecting flights
  total_duration_minutes: number;
  stops: number; // 0 = direct, 1 = 1 stop, etc.
  price: number;
  currency: string;
  cabin_class: "economy" | "premium_economy" | "business" | "first";
  available_seats: number;
}

export interface FlightSearchParams {
  origin: string; // IATA airport code
  destination: string; // IATA airport code
  departure_date: string; // YYYY-MM-DD
  return_date?: string; // YYYY-MM-DD (optional for one-way)
  passengers: number;
  cabin_class?: "economy" | "premium_economy" | "business" | "first";
  max_stops?: number; // Filter: 0 = direct only, 1 = max 1 stop
}

export interface CruiseFlightPackage {
  id: string;
  cruise: {
    id: string;
    name: string;
    ship_name: string;
    departure_port: string;
    departure_date: string;
    return_date: string;
    duration_days: number;
    destinations: string[];
    cruise_price: number;
    image_url?: string;
  };
  flights: {
    outbound: Flight;
    return: Flight;
  };
  pricing: {
    cruise_price: number;
    flight_price: number;
    total_price: number;
    discount?: number; // Package discount amount
    currency: string;
  };
  package_benefits?: string[]; // e.g., "무료 공항 픽업", "사전 체크인"
}

export interface PackageSearchParams {
  // Cruise preferences
  cruise_destination?: string;
  cruise_departure_date?: string;
  cruise_duration?: string;

  // Flight preferences
  departure_airport: string; // Korean airport (ICN/GMP/PUS)
  cabin_class?: "economy" | "premium_economy" | "business" | "first";
  max_stops?: number;

  // Common
  passengers: number;
}

export interface KoreanAirport {
  code: string;
  name: string;
  name_en: string;
}

// Korean departure airports
export const KOREAN_AIRPORTS: KoreanAirport[] = [
  { code: "ICN", name: "인천국제공항", name_en: "Incheon International Airport" },
  { code: "GMP", name: "김포국제공항", name_en: "Gimpo International Airport" },
  { code: "PUS", name: "김해국제공항", name_en: "Gimhae International Airport" },
];

// Major cruise departure airports
export const CRUISE_PORT_AIRPORTS: Record<string, Airport> = {
  "Miami, FL": {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "USA",
  },
  "Barcelona, Spain": {
    code: "BCN",
    name: "Barcelona El Prat Airport",
    city: "Barcelona",
    country: "Spain",
  },
  "Copenhagen, Denmark": {
    code: "CPH",
    name: "Copenhagen Airport",
    city: "Copenhagen",
    country: "Denmark",
  },
  "Rome, Italy": {
    code: "FCO",
    name: "Leonardo da Vinci Airport",
    city: "Rome",
    country: "Italy",
  },
};
