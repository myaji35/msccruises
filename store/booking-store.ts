import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BookingDraft,
  CruiseOption,
  CabinOption,
  Extra,
  PassengerInfo,
  PaymentInfo,
} from '@/types/booking.types';

interface BookingStore extends BookingDraft {
  // Actions
  setCurrentStep: (step: number) => void;

  // Step 1: Cruise Selection
  selectCruise: (cruise: CruiseOption) => void;
  clearCruise: () => void;

  // Step 2: Cabin Selection
  selectCabin: (cabin: CabinOption) => void;
  setCabinNumber: (cabinNumber: string) => void;
  setNumCabins: (num: number) => void;
  clearCabin: () => void;

  // Step 3: Extras
  addExtra: (extra: Extra) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  clearExtras: () => void;

  // Step 4: Passengers
  addPassenger: (passenger: PassengerInfo) => void;
  updatePassenger: (index: number, passenger: PassengerInfo) => void;
  removePassenger: (index: number) => void;
  clearPassengers: () => void;

  // Payment
  setPaymentInfo: (payment: PaymentInfo) => void;
  clearPaymentInfo: () => void;

  // Pricing
  setPromoCode: (code: string) => void;
  setPromoDiscount: (discount: number) => void;
  calculateTotalPrice: () => void;

  // Draft Management
  saveDraft: () => void;
  loadDraft: (draftId: string) => void;
  clearDraft: () => void;

  // Navigation
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;

  // Reset
  resetBooking: () => void;
}

const initialState: BookingDraft = {
  selectedCruise: null,
  selectedCabin: null,
  cabinNumber: undefined,
  numCabins: 1,
  extras: [],
  passengers: [],
  payment: null,
  basePrice: 0,
  extrasTotal: 0,
  promoCode: undefined,
  promoDiscount: 0,
  totalPrice: 0,
  currentStep: 1,
  lastUpdated: new Date(),
  draftId: undefined,
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Step Navigation
      setCurrentStep: (step) => set({ currentStep: step, lastUpdated: new Date() }),

      goToNextStep: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
          set({ currentStep: currentStep + 1, lastUpdated: new Date() });
        }
      },

      goToPreviousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1, lastUpdated: new Date() });
        }
      },

      goToStep: (step) => {
        if (step >= 1 && step <= 4) {
          set({ currentStep: step, lastUpdated: new Date() });
        }
      },

      // Step 1: Cruise Selection
      selectCruise: (cruise) => {
        set({
          selectedCruise: cruise,
          basePrice: cruise.startingPrice,
          lastUpdated: new Date(),
        });
        get().calculateTotalPrice();
      },

      clearCruise: () => {
        set({
          selectedCruise: null,
          basePrice: 0,
          lastUpdated: new Date(),
        });
        get().calculateTotalPrice();
      },

      // Step 2: Cabin Selection
      selectCabin: (cabin) => {
        set({
          selectedCabin: cabin,
          basePrice: cabin.price,
          lastUpdated: new Date(),
        });
        get().calculateTotalPrice();
      },

      setCabinNumber: (cabinNumber) => {
        set({ cabinNumber, lastUpdated: new Date() });
      },

      setNumCabins: (num) => {
        set({ numCabins: num, lastUpdated: new Date() });
        get().calculateTotalPrice();
      },

      clearCabin: () => {
        set({
          selectedCabin: null,
          cabinNumber: undefined,
          lastUpdated: new Date(),
        });
      },

      // Step 3: Extras
      addExtra: (extra) => {
        const { extras } = get();
        const existingIndex = extras.findIndex((e) => e.id === extra.id);

        if (existingIndex >= 0) {
          // Update quantity if already exists
          const updated = [...extras];
          updated[existingIndex].quantity += extra.quantity;
          set({ extras: updated, lastUpdated: new Date() });
        } else {
          set({ extras: [...extras, extra], lastUpdated: new Date() });
        }
        get().calculateTotalPrice();
      },

      removeExtra: (extraId) => {
        const { extras } = get();
        set({
          extras: extras.filter((e) => e.id !== extraId),
          lastUpdated: new Date(),
        });
        get().calculateTotalPrice();
      },

      updateExtraQuantity: (extraId, quantity) => {
        const { extras } = get();
        const updated = extras.map((e) =>
          e.id === extraId ? { ...e, quantity } : e
        );
        set({ extras: updated, lastUpdated: new Date() });
        get().calculateTotalPrice();
      },

      clearExtras: () => {
        set({ extras: [], extrasTotal: 0, lastUpdated: new Date() });
        get().calculateTotalPrice();
      },

      // Step 4: Passengers
      addPassenger: (passenger) => {
        const { passengers } = get();
        set({
          passengers: [...passengers, passenger],
          lastUpdated: new Date(),
        });
      },

      updatePassenger: (index, passenger) => {
        const { passengers } = get();
        const updated = [...passengers];
        updated[index] = passenger;
        set({ passengers: updated, lastUpdated: new Date() });
      },

      removePassenger: (index) => {
        const { passengers } = get();
        set({
          passengers: passengers.filter((_, i) => i !== index),
          lastUpdated: new Date(),
        });
      },

      clearPassengers: () => {
        set({ passengers: [], lastUpdated: new Date() });
      },

      // Payment
      setPaymentInfo: (payment) => {
        set({ payment, lastUpdated: new Date() });
      },

      clearPaymentInfo: () => {
        set({ payment: null, lastUpdated: new Date() });
      },

      // Pricing
      setPromoCode: (code) => {
        set({ promoCode: code, lastUpdated: new Date() });
      },

      setPromoDiscount: (discount) => {
        set({ promoDiscount: discount, lastUpdated: new Date() });
        get().calculateTotalPrice();
      },

      calculateTotalPrice: () => {
        const { basePrice, extras, promoDiscount, numCabins, selectedCruise } = get();

        // Calculate extras total
        const extrasTotal = extras.reduce((sum, extra) => {
          const extraPrice = extra.price * extra.quantity;
          // If per-day pricing and cruise duration is available
          if (extra.perDay && selectedCruise) {
            return sum + extraPrice * selectedCruise.durationDays;
          }
          return sum + extraPrice;
        }, 0);

        // Calculate base total (cabin price * number of cabins)
        const cabinTotal = basePrice * numCabins;

        // Calculate total
        const subtotal = cabinTotal + extrasTotal;
        const total = subtotal - promoDiscount;

        set({
          extrasTotal,
          totalPrice: Math.max(0, total), // Ensure non-negative
          lastUpdated: new Date(),
        });
      },

      // Draft Management
      saveDraft: () => {
        const state = get();
        const draftId = state.draftId || `draft-${Date.now()}`;

        localStorage.setItem(
          `booking-draft-${draftId}`,
          JSON.stringify({
            ...state,
            draftId,
            lastUpdated: new Date(),
          })
        );

        set({ draftId, lastUpdated: new Date() });
      },

      loadDraft: (draftId) => {
        const saved = localStorage.getItem(`booking-draft-${draftId}`);
        if (saved) {
          const draft = JSON.parse(saved);

          // Check if draft is not expired (24 hours)
          const lastUpdated = new Date(draft.lastUpdated);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            set({ ...draft });
          } else {
            console.log('Draft expired');
            localStorage.removeItem(`booking-draft-${draftId}`);
          }
        }
      },

      clearDraft: () => {
        const { draftId } = get();
        if (draftId) {
          localStorage.removeItem(`booking-draft-${draftId}`);
        }
        set({ draftId: undefined, lastUpdated: new Date() });
      },

      // Reset
      resetBooking: () => {
        get().clearDraft();
        set({ ...initialState, currentStep: 1, lastUpdated: new Date() });
      },
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        // Only persist these fields
        selectedCruise: state.selectedCruise,
        selectedCabin: state.selectedCabin,
        cabinNumber: state.cabinNumber,
        numCabins: state.numCabins,
        extras: state.extras,
        passengers: state.passengers,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
        currentStep: state.currentStep,
        draftId: state.draftId,
        lastUpdated: state.lastUpdated,
        // Do NOT persist payment info for security
      }),
    }
  )
);
