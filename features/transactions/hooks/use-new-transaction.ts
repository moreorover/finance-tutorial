import { create } from "zustand";

type State = {
  isOpen: boolean;
  orderId?: string;
};

type NewTransactionState = {
  state: State;
  onOpen: (orderId?: string) => void;
  onClose: () => void;
};

export const useNewTransaction = create<NewTransactionState>((set) => ({
  state: { isOpen: false },
  onOpen: (orderId?: string) => set({ state: { isOpen: true, orderId } }),
  onClose: () => set({ state: { isOpen: false } }),
}));
