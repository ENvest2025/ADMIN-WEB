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
  role?: string;
  image?: string;
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

const STORAGE_KEY = 'envest_user_session';

// Load any persisted session so a page reload keeps the admin logged in
// (the store is otherwise re-created as `null` on every load).
// Persisted in localStorage so the admin's details survive reloads and browser
// restarts for as long as the auth token (also in localStorage) is valid.
const loadPersistedUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const persistUser = (user: User | null) => {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage unavailable — ignore */
  }
};

const initialUser = loadPersistedUser();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!initialUser,
  user: initialUser,
  isLoading: false,
  error: null,

  setUser: (user: User | null) => {
    persistUser(user);
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    });
  },

  logout: () => {
    persistUser(null);
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),
}));
