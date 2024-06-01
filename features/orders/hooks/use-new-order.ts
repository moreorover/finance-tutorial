import { create } from "zustand";

type NewOrderState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewOrder = create<NewOrderState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
