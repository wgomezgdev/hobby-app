import { create } from 'zustand';

interface StatsUiStore {
  selectedYear: number | 'all';
  setYear: (year: number | 'all') => void;
}

export const useStatsUiStore = create<StatsUiStore>((set) => ({
  selectedYear: new Date().getFullYear(),
  setYear: (selectedYear) => set({ selectedYear }),
}));
