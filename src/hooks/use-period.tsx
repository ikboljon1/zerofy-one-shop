import { create } from 'zustand';
import { Period } from '@/types/analytics';

interface PeriodStore {
  period: Period;
  setPeriod: (period: Period) => void;
}

export const usePeriod = create<PeriodStore>((set) => ({
  period: {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  },
  setPeriod: (period) => set({ period })
}));