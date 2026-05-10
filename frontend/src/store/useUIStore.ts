import { create } from 'zustand';

interface UIState {
  menuOuvert: boolean;
  toggleMenu: () => void;
  fermerMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  menuOuvert: false,
  toggleMenu: () => set((state) => ({ menuOuvert: !state.menuOuvert })),
  fermerMenu: () => set({ menuOuvert: false }),
}));