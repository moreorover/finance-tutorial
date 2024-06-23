import { create } from "zustand";

type OpenHairTransactionState = {
  id?: string;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useOpenHairTransaction = create<OpenHairTransactionState>(
  (set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({ isOpen: true, id }),
    onClose: () => set({ isOpen: false, id: undefined }),
  }),
);
