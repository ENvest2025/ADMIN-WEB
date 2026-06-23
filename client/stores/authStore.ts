import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryOfOrigin?: string;
  bankName?: string;
  accountNumber?: string;
  bvn?: string;
  nin?: string;
  idType?: string;
  idNumber?: string;
  faceVerified?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  setUser: (user: User | null) => void;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),
}));
