import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartCruise {
  cruiseId: string;
  cruiseName: string;
  shipName: string;
  itineraryId: string;
  departureDate: string;
  returnDate: string;
  departurePort: string;
  durationDays: number;
}

export interface CartCabin {
  category: string;
  deckNumber: number | null;
  cabinNumber: string | null;
  price: number;
}

export interface CartPassenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  gender: 'male' | 'female';
}

export interface CartFlight {
  outboundFlightNumber: string | null;
  returnFlightNumber: string | null;
  totalPrice: number;
}

export interface CartItem {
  id: string; // Unique cart item ID
  cruise: CartCruise;
  cabin: CartCabin;
  passengers: CartPassenger[];
  flight: CartFlight | null;
  isPackage: boolean;
  basePrice: number;
  totalPrice: number;
  addedAt: string; // ISO timestamp
}

export interface CartState {
  items: CartItem[];

  // Actions
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;

  // Getters
  getCartCount: () => number;
  getCartTotal: () => number;
  getCartItem: (itemId: string) => CartItem | undefined;

  // Validation
  isItemInCart: (cruiseId: string, departureDate: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        const newItem: CartItem = {
          ...item,
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          addedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateCartItem: (itemId, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartCount: () => {
        return get().items.length;
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },

      getCartItem: (itemId) => {
        return get().items.find((item) => item.id === itemId);
      },

      isItemInCart: (cruiseId, departureDate) => {
        return get().items.some(
          (item) =>
            item.cruise.cruiseId === cruiseId &&
            item.cruise.departureDate === departureDate
        );
      },
    }),
    {
      name: 'cart-storage',
      // Auto-clear cart items older than 7 days
      onRehydrateStorage: () => (state) => {
        if (state) {
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          state.items = state.items.filter(
            (item) => new Date(item.addedAt).getTime() > sevenDaysAgo
          );
        }
      },
    }
  )
);
