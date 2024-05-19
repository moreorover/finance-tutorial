import { create } from "zustand";

type NewAccountTagState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewAccountTag = create<NewAccountTagState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
