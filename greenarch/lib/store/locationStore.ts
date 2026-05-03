/**
 * Zustand store for user location
 */
import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lng: number | null;
  setLocation: (lat: number, lng: number) => void;
}

export const useLocationStore = create<LocationState>(set => ({
  lat: null,
  lng: null,
  setLocation: (lat: number, lng: number) => set({ lat, lng }),
}));
