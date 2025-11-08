import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchFilters {
  // Destination & Location
  destination: string | null;
  departurePort: string | null;
  region: string | null; // e.g., "Mediterranean", "Caribbean", "Asia"

  // Date Range
  startDate: string | null;
  endDate: string | null;

  // Duration
  minDuration: number | null; // in days
  maxDuration: number | null;

  // Price Range
  minPrice: number;
  maxPrice: number;
  currency: 'USD' | 'KRW' | 'EUR';

  // Ship & Cruise Type
  shipName: string | null;
  cruiseType: 'luxury' | 'family' | 'adventure' | null;

  // Amenities & Features
  hasYachtClub: boolean;
  hasSpa: boolean;
  hasKidsClub: boolean;

  // Availability
  availableOnly: boolean;
}

export type SortOption =
  | 'popular'       // Featured/Most popular
  | 'price-asc'     // Price: Low to High
  | 'price-desc'    // Price: High to Low
  | 'duration-asc'  // Duration: Short to Long
  | 'duration-desc' // Duration: Long to Short
  | 'departure'     // Departure Date: Earliest first
  | 'newest';       // Newly added cruises

export interface SearchState {
  // Search Query
  searchQuery: string;

  // Filters
  filters: SearchFilters;

  // Sorting & Pagination
  sortBy: SortOption;
  page: number;
  pageSize: number;

  // UI State
  isFilterOpen: boolean;
  viewMode: 'grid' | 'list';

  // Quick Filters (commonly used combinations)
  quickFilter: 'all' | 'weekend' | 'week' | 'luxury' | 'family' | null;

  // Actions
  setSearchQuery: (query: string) => void;

  setFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;

  setFilters: (filters: Partial<SearchFilters>) => void;

  setSortBy: (sortBy: SortOption) => void;

  setPage: (page: number) => void;

  setViewMode: (mode: 'grid' | 'list') => void;

  toggleFilter: () => void;

  setQuickFilter: (filter: SearchState['quickFilter']) => void;

  resetFilters: () => void;

  resetAll: () => void;
}

const initialFilters: SearchFilters = {
  destination: null,
  departurePort: null,
  region: null,
  startDate: null,
  endDate: null,
  minDuration: null,
  maxDuration: null,
  minPrice: 0,
  maxPrice: 10000,
  currency: 'USD',
  shipName: null,
  cruiseType: null,
  hasYachtClub: false,
  hasSpa: false,
  hasKidsClub: false,
  availableOnly: true,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchQuery: '',
      filters: initialFilters,
      sortBy: 'popular',
      page: 1,
      pageSize: 12,
      isFilterOpen: false,
      viewMode: 'grid',
      quickFilter: null,

      setSearchQuery: (query) => {
        set({ searchQuery: query, page: 1 });
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          page: 1, // Reset to first page when filter changes
        }));
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          page: 1,
        }));
      },

      setSortBy: (sortBy) => {
        set({ sortBy, page: 1 });
      },

      setPage: (page) => {
        set({ page });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      toggleFilter: () => {
        set((state) => ({ isFilterOpen: !state.isFilterOpen }));
      },

      setQuickFilter: (filter) => {
        set({ quickFilter: filter });

        // Apply predefined filters based on quick filter
        switch (filter) {
          case 'weekend':
            set((state) => ({
              filters: {
                ...state.filters,
                minDuration: 2,
                maxDuration: 3,
              },
            }));
            break;

          case 'week':
            set((state) => ({
              filters: {
                ...state.filters,
                minDuration: 7,
                maxDuration: 10,
              },
            }));
            break;

          case 'luxury':
            set((state) => ({
              filters: {
                ...state.filters,
                cruiseType: 'luxury',
                hasYachtClub: true,
                hasSpa: true,
              },
            }));
            break;

          case 'family':
            set((state) => ({
              filters: {
                ...state.filters,
                cruiseType: 'family',
                hasKidsClub: true,
              },
            }));
            break;

          case 'all':
          default:
            set({ filters: initialFilters });
            break;
        }

        set({ page: 1 });
      },

      resetFilters: () => {
        set({
          filters: initialFilters,
          quickFilter: null,
          page: 1,
        });
      },

      resetAll: () => {
        set({
          searchQuery: '',
          filters: initialFilters,
          sortBy: 'popular',
          page: 1,
          quickFilter: null,
        });
      },
    }),
    {
      name: 'search-storage',
      // Only persist certain parts of the state
      partialize: (state) => ({
        filters: state.filters,
        sortBy: state.sortBy,
        viewMode: state.viewMode,
      }),
    }
  )
);
