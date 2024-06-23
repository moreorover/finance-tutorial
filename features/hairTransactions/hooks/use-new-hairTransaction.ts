import { create } from "zustand";

type State = {
  isOpen: boolean;
  orderId?: string;
};

type Actions = {
  onOpen: () => void;
  onClose: () => void;
  setOrderId: (orderId: string) => void;
};

const initialState: State = {
  isOpen: false,
  orderId: undefined,
};

export const useNewHairTransaction = create<State & Actions>((set) => ({
  ...initialState,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set(initialState),
  setOrderId: (orderId: string) => set({ orderId }),
}));
