import { create } from 'zustand';
import type { BookStatus } from '../types/entities';

export type FilterValue = 'all' | BookStatus;
export type SortValue = 'recent' | 'title' | 'author';

interface LibraryUiStore {
  filter: FilterValue;
  sort: SortValue;
  setFilter: (filter: FilterValue) => void;
  setSort: (sort: SortValue) => void;
}

export const useLibraryUiStore = create<LibraryUiStore>((set) => ({
  filter: 'all',
  sort: 'recent',
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
}));
