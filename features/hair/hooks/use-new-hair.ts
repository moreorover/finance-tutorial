import { create } from "zustand";

type NewHairState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewHair = create<NewHairState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
