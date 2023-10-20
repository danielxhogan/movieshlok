import { create } from "zustand";

interface UseSearchState {
  searchHeading: string;
  searchQuery: string;
  filter: string;
  shown: boolean;
  setSearchHeading: (searchHeading: string) => void;
  setSearchQuery: (searchQuery: string) => void;
  setFilter: (filter: string) => void;
  setShown: (shown: boolean) => void;
  toggleShown: (shown: boolean) => void;
}

export const useSearchStore = create<UseSearchState>((set) => ({
  searchHeading: "",
  searchQuery: "",
  filter: "movie",
  shown: false,
  setSearchHeading: (searchHeading) => set({ searchHeading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (filter) => set({ filter }),
  setShown: (shown) => set({ shown }),
  toggleShown: (shown) => {
    const toggledShown = !shown;
    set({ shown: toggledShown });
  },
}));
