import { create } from 'zustand';

interface UiStore {
  importDialogOpen: boolean;
  setImportDialogOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  importDialogOpen: false,
  setImportDialogOpen: (open) => set({ importDialogOpen: open }),
}));
