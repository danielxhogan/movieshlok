import { create } from "zustand";

interface UseSearchBarState {
  searchQuery: string;
  shown: boolean;
  setSearchQuery: (searchQuery: string) => void;
  setShown: (shown: boolean) => void;
}

export const useSearchBarStore = create<UseSearchBarState>((set) => ({
  searchQuery: "",
  shown: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShown: (shown) => set({ shown }),
}));

// interface UseBearState {
//   bears: number;
//   increasePopulation: () => void;
//   removeAllBears: () => void;
// }

// export const useBearStore = create<UseBearState>((set) => ({
//   bears: 0,
//   increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
//   removeAllBears: () => set({ bears: 0 }),
// }));
