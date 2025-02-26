
import { create } from 'zustand';
import { Store } from '@/types/store';

interface StoreState {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedStore: null,
  setSelectedStore: (store) => set({ selectedStore: store }),
}));
