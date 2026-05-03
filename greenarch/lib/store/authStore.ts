/**
 * Zustand store for authentication
 */
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  role: string | null;
  setUser: (user: any) => void;
  setRole: (role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  role: null,
  setUser: (user: any) => set({ user }),
  setRole: (role: string) => set({ role }),
  logout: () => set({ user: null, role: null }),
}));
