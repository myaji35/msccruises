import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  userType: 'admin' | 'partner' | 'customer';
}

export interface VoyagersClub {
  membershipNumber: string;
  tier: 'classic' | 'silver' | 'gold' | 'black';
  points: number;
  joinedAt: string;
}

export interface PartnerInfo {
  companyName: string;
  businessNumber: string;
  representativeName: string;
  commissionRate: number;
  subpageUrl: string;
  status: 'active' | 'pending' | 'suspended';
}

export interface AuthState {
  // User Information
  user: User | null;
  isAuthenticated: boolean;

  // Additional User Data
  voyagersClub: VoyagersClub | null;
  partnerInfo: PartnerInfo | null;

  // Session
  sessionExpiry: string | null;

  // Actions
  setUser: (user: User) => void;
  setVoyagersClub: (club: VoyagersClub) => void;
  setPartnerInfo: (info: PartnerInfo) => void;
  updateUser: (userData: Partial<User>) => void;

  login: (user: User, sessionExpiry?: string) => void;
  logout: () => void;

  // Voyagers Club Actions
  addPoints: (points: number) => void;
  updateTier: (tier: VoyagersClub['tier']) => void;

  // Permission Checks
  isAdmin: () => boolean;
  isPartner: () => boolean;
  isCustomer: () => boolean;
  canAccessAdminPanel: () => boolean;
  canManageBookings: () => boolean;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  voyagersClub: null,
  partnerInfo: null,
  sessionExpiry: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: true
        });
      },

      setVoyagersClub: (club) => {
        set({ voyagersClub: club });
      },

      setPartnerInfo: (info) => {
        set({ partnerInfo: info });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      login: (user, sessionExpiry) => {
        set({
          user,
          isAuthenticated: true,
          sessionExpiry: sessionExpiry || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      },

      logout: () => {
        set(initialState);
        // Clear all persisted data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
      },

      addPoints: (points) => {
        set((state) => {
          if (!state.voyagersClub) return state;

          const newPoints = state.voyagersClub.points + points;
          let newTier = state.voyagersClub.tier;

          // Auto tier upgrade logic
          if (newPoints >= 50000 && state.voyagersClub.tier !== 'black') {
            newTier = 'black';
          } else if (newPoints >= 20000 && state.voyagersClub.tier === 'classic') {
            newTier = 'gold';
          } else if (newPoints >= 5000 && state.voyagersClub.tier === 'classic') {
            newTier = 'silver';
          }

          return {
            voyagersClub: {
              ...state.voyagersClub,
              points: newPoints,
              tier: newTier,
            },
          };
        });
      },

      updateTier: (tier) => {
        set((state) => ({
          voyagersClub: state.voyagersClub
            ? { ...state.voyagersClub, tier }
            : null,
        }));
      },

      // Permission Checks
      isAdmin: () => {
        const { user } = get();
        return user?.userType === 'admin';
      },

      isPartner: () => {
        const { user } = get();
        return user?.userType === 'partner';
      },

      isCustomer: () => {
        const { user } = get();
        return user?.userType === 'customer';
      },

      canAccessAdminPanel: () => {
        return get().isAdmin();
      },

      canManageBookings: () => {
        const { user } = get();
        return user?.userType === 'admin' || user?.userType === 'partner';
      },
    }),
    {
      name: 'auth-storage',
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
        voyagersClub: state.voyagersClub,
        partnerInfo: state.partnerInfo,
      }),
    }
  )
);
