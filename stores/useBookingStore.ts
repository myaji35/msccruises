import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  nationality: string;
  gender: 'male' | 'female';
  isMainPassenger: boolean;
}

export interface FlightInfo {
  outboundFlightId: string | null;
  outboundFlightNumber: string | null;
  outboundDeparture: string | null;
  outboundArrival: string | null;
  returnFlightId: string | null;
  returnFlightNumber: string | null;
  returnDeparture: string | null;
  returnArrival: string | null;
}

export interface CabinSelection {
  category: string | null;
  deckNumber: number | null;
  cabinNumber: string | null;
  price: number;
}

export interface BookingState {
  // Cruise Information
  cruiseId: string | null;
  cruiseName: string | null;
  cruiseItineraryId: string | null;
  shipName: string | null;
  departureDate: string | null;
  returnDate: string | null;
  departurePort: string | null;
  durationDays: number | null;

  // Cabin Selection
  cabin: CabinSelection;

  // Passengers
  passengers: Passenger[];

  // Flight Information (for package bookings)
  isPackage: boolean;
  flightInfo: FlightInfo;

  // Pricing
  cruiseBasePrice: number;
  flightPrice: number;
  packageDiscount: number;
  totalPrice: number;

  // Booking Flow State
  currentStep: 'cruise' | 'cabin' | 'flight' | 'passengers' | 'payment';

  // Actions
  setCruise: (cruise: {
    id: string;
    name: string;
    itineraryId: string;
    shipName: string;
    departureDate: string;
    returnDate: string;
    departurePort: string;
    durationDays: number;
    basePrice: number;
  }) => void;

  setCabin: (cabin: Partial<CabinSelection>) => void;

  setIsPackage: (isPackage: boolean) => void;

  setFlightInfo: (flight: Partial<FlightInfo>) => void;

  addPassenger: (passenger: Passenger) => void;
  updatePassenger: (index: number, passenger: Partial<Passenger>) => void;
  removePassenger: (index: number) => void;

  setCurrentStep: (step: BookingState['currentStep']) => void;

  calculateTotal: () => void;

  clearBooking: () => void;
}

const initialState = {
  cruiseId: null,
  cruiseName: null,
  cruiseItineraryId: null,
  shipName: null,
  departureDate: null,
  returnDate: null,
  departurePort: null,
  durationDays: null,
  cabin: {
    category: null,
    deckNumber: null,
    cabinNumber: null,
    price: 0,
  },
  passengers: [],
  isPackage: false,
  flightInfo: {
    outboundFlightId: null,
    outboundFlightNumber: null,
    outboundDeparture: null,
    outboundArrival: null,
    returnFlightId: null,
    returnFlightNumber: null,
    returnDeparture: null,
    returnArrival: null,
  },
  cruiseBasePrice: 0,
  flightPrice: 0,
  packageDiscount: 0,
  totalPrice: 0,
  currentStep: 'cruise' as const,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCruise: (cruise) => {
        set({
          cruiseId: cruise.id,
          cruiseName: cruise.name,
          cruiseItineraryId: cruise.itineraryId,
          shipName: cruise.shipName,
          departureDate: cruise.departureDate,
          returnDate: cruise.returnDate,
          departurePort: cruise.departurePort,
          durationDays: cruise.durationDays,
          cruiseBasePrice: cruise.basePrice,
          currentStep: 'cabin',
        });
        get().calculateTotal();
      },

      setCabin: (cabin) => {
        set((state) => ({
          cabin: { ...state.cabin, ...cabin },
          currentStep: 'flight',
        }));
        get().calculateTotal();
      },

      setIsPackage: (isPackage) => {
        set({ isPackage });
        if (!isPackage) {
          set({
            flightInfo: initialState.flightInfo,
            flightPrice: 0,
            packageDiscount: 0,
          });
        }
        get().calculateTotal();
      },

      setFlightInfo: (flight) => {
        set((state) => ({
          flightInfo: { ...state.flightInfo, ...flight },
        }));
        get().calculateTotal();
      },

      addPassenger: (passenger) => {
        set((state) => ({
          passengers: [...state.passengers, passenger],
        }));
        get().calculateTotal();
      },

      updatePassenger: (index, passengerUpdate) => {
        set((state) => ({
          passengers: state.passengers.map((p, i) =>
            i === index ? { ...p, ...passengerUpdate } : p
          ),
        }));
      },

      removePassenger: (index) => {
        set((state) => ({
          passengers: state.passengers.filter((_, i) => i !== index),
        }));
        get().calculateTotal();
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      calculateTotal: () => {
        const state = get();
        let total = 0;

        // Base cruise price per passenger
        total += state.cruiseBasePrice * state.passengers.length;

        // Cabin price
        total += state.cabin.price;

        // Flight price if package
        if (state.isPackage && state.flightPrice > 0) {
          total += state.flightPrice * state.passengers.length;

          // Apply package discount (e.g., 10% discount)
          const discount = total * 0.1;
          set({ packageDiscount: discount });
          total -= discount;
        } else {
          set({ packageDiscount: 0 });
        }

        set({ totalPrice: total });
      },

      clearBooking: () => {
        set(initialState);
      },
    }),
    {
      name: 'booking-storage',
      // Don't persist sensitive data in production
      partialize: (state) => ({
        cruiseId: state.cruiseId,
        cruiseName: state.cruiseName,
        departureDate: state.departureDate,
        cabin: state.cabin,
        isPackage: state.isPackage,
        currentStep: state.currentStep,
      }),
    }
  )
);
