import { create } from 'zustand';

export interface CruiseStats {
  totalCruises: number;
  activeCruises: number;
  draftCruises: number;
  featuredCruises: number;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  todayBookings: number;
  thisMonthBookings: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

export interface UserStats {
  totalUsers: number;
  customers: number;
  partners: number;
  admins: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
}

export interface SNSAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'threads';
  accountId: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

export interface DashboardMetrics {
  cruiseStats: CruiseStats;
  bookingStats: BookingStats;
  userStats: UserStats;
  topSellingCruises: {
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }[];
  recentActivities: {
    id: string;
    type: 'booking' | 'user' | 'cruise' | 'payment';
    description: string;
    timestamp: string;
  }[];
}

export interface AdminState {
  // Dashboard Data
  metrics: DashboardMetrics | null;
  isLoadingMetrics: boolean;

  // Cruise Management
  selectedCruiseId: string | null;
  cruiseListView: 'grid' | 'list';
  cruiseFilter: 'all' | 'active' | 'draft' | 'inactive' | 'featured';

  // SNS Management
  snsAccounts: SNSAccount[];
  isLoadingSns: boolean;

  // UI State
  sidebarCollapsed: boolean;
  currentSection: 'dashboard' | 'cruises' | 'bookings' | 'users' | 'sns' | 'settings';

  // Actions - Dashboard
  setMetrics: (metrics: DashboardMetrics) => void;
  refreshMetrics: () => Promise<void>;
  setLoadingMetrics: (loading: boolean) => void;

  // Actions - Cruise Management
  setSelectedCruise: (cruiseId: string | null) => void;
  setCruiseListView: (view: 'grid' | 'list') => void;
  setCruiseFilter: (filter: AdminState['cruiseFilter']) => void;

  // Actions - SNS Management
  setSnsAccounts: (accounts: SNSAccount[]) => void;
  addSnsAccount: (account: SNSAccount) => void;
  removeSnsAccount: (accountId: string) => void;
  updateSnsAccount: (accountId: string, updates: Partial<SNSAccount>) => void;
  setLoadingSns: (loading: boolean) => void;

  // Actions - UI
  toggleSidebar: () => void;
  setCurrentSection: (section: AdminState['currentSection']) => void;

  // Bulk Actions
  bulkDeleteCruises: (cruiseIds: string[]) => Promise<void>;
  bulkUpdateCruiseStatus: (cruiseIds: string[], status: 'active' | 'inactive') => Promise<void>;

  // Analytics
  getRevenueGrowth: () => number;
  getBookingGrowth: () => number;
  getUserGrowth: () => number;
}

const initialMetrics: DashboardMetrics = {
  cruiseStats: {
    totalCruises: 0,
    activeCruises: 0,
    draftCruises: 0,
    featuredCruises: 0,
  },
  bookingStats: {
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    todayBookings: 0,
    thisMonthBookings: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
  },
  userStats: {
    totalUsers: 0,
    customers: 0,
    partners: 0,
    admins: 0,
    newUsersThisMonth: 0,
    activeUsersToday: 0,
  },
  topSellingCruises: [],
  recentActivities: [],
};

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial State
  metrics: null,
  isLoadingMetrics: false,
  selectedCruiseId: null,
  cruiseListView: 'grid',
  cruiseFilter: 'all',
  snsAccounts: [],
  isLoadingSns: false,
  sidebarCollapsed: false,
  currentSection: 'dashboard',

  // Dashboard Actions
  setMetrics: (metrics) => {
    set({ metrics });
  },

  refreshMetrics: async () => {
    set({ isLoadingMetrics: true });
    try {
      // Fetch metrics from API
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        set({ metrics: data, isLoadingMetrics: false });
      } else {
        throw new Error('Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      set({ isLoadingMetrics: false, metrics: initialMetrics });
    }
  },

  setLoadingMetrics: (loading) => {
    set({ isLoadingMetrics: loading });
  },

  // Cruise Management Actions
  setSelectedCruise: (cruiseId) => {
    set({ selectedCruiseId: cruiseId });
  },

  setCruiseListView: (view) => {
    set({ cruiseListView: view });
  },

  setCruiseFilter: (filter) => {
    set({ cruiseFilter: filter });
  },

  // SNS Management Actions
  setSnsAccounts: (accounts) => {
    set({ snsAccounts: accounts });
  },

  addSnsAccount: (account) => {
    set((state) => ({
      snsAccounts: [...state.snsAccounts, account],
    }));
  },

  removeSnsAccount: (accountId) => {
    set((state) => ({
      snsAccounts: state.snsAccounts.filter((acc) => acc.id !== accountId),
    }));
  },

  updateSnsAccount: (accountId, updates) => {
    set((state) => ({
      snsAccounts: state.snsAccounts.map((acc) =>
        acc.id === accountId ? { ...acc, ...updates } : acc
      ),
    }));
  },

  setLoadingSns: (loading) => {
    set({ isLoadingSns: loading });
  },

  // UI Actions
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setCurrentSection: (section) => {
    set({ currentSection: section });
  },

  // Bulk Actions
  bulkDeleteCruises: async (cruiseIds) => {
    try {
      const response = await fetch('/api/admin/cruises/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cruiseIds }),
      });

      if (!response.ok) {
        throw new Error('Bulk delete failed');
      }

      // Refresh metrics after deletion
      get().refreshMetrics();
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  },

  bulkUpdateCruiseStatus: async (cruiseIds, status) => {
    try {
      const response = await fetch('/api/admin/cruises/bulk-update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cruiseIds, status }),
      });

      if (!response.ok) {
        throw new Error('Bulk update failed');
      }

      // Refresh metrics after update
      get().refreshMetrics();
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  },

  // Analytics Calculations
  getRevenueGrowth: () => {
    const { metrics } = get();
    if (!metrics) return 0;

    const { thisMonthRevenue, totalRevenue } = metrics.bookingStats;
    const lastMonthRevenue = totalRevenue - thisMonthRevenue;

    if (lastMonthRevenue === 0) return 100;
    return ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  },

  getBookingGrowth: () => {
    const { metrics } = get();
    if (!metrics) return 0;

    const { thisMonthBookings, totalBookings } = metrics.bookingStats;
    const lastMonthBookings = totalBookings - thisMonthBookings;

    if (lastMonthBookings === 0) return 100;
    return ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100;
  },

  getUserGrowth: () => {
    const { metrics } = get();
    if (!metrics) return 0;

    const { newUsersThisMonth, totalUsers } = metrics.userStats;
    const lastMonthUsers = totalUsers - newUsersThisMonth;

    if (lastMonthUsers === 0) return 100;
    return ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100;
  },
}));
