/**
 * Zustand store for UI state
 */
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  openModal: (name: string) => void;
  closeModal: (name: string) => void;
  modals: Record<string, boolean>;
}

export const useUIStore = create<UIState>(set => ({
  sidebarOpen: false,
  modals: {},
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (name: string) => set(state => ({ modals: { ...state.modals, [name]: true } })),
  closeModal: (name: string) => set(state => ({ modals: { ...state.modals, [name]: false } })),
}));
