import { create } from "zustand";

type State = {
  isOpen: boolean;
  orderId?: string;
  sellerId?: string;
};

type Actions = {
  onOpen: () => void;
  onClose: () => void;
  setOrderId: (orderId: string) => void;
  setSellerId: (sellerId: string) => void;
};

const initialState: State = {
  isOpen: false,
  orderId: undefined,
  sellerId: undefined,
};

export const useNewHair = create<State & Actions>((set) => ({
  ...initialState,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set(initialState),
  setOrderId: (orderId: string) => set({ orderId }),
  setSellerId: (sellerId: string) => set({ sellerId }),
}));
