import { create } from "zustand";

type State = {
  isOpen: boolean;
  orderId?: string;
  accountId?: string;
};

type Actions = {
  onOpen: () => void;
  onClose: () => void;
  setOrderId: (orderId: string) => void;
  setAccountId: (accountId: string) => void;
};

const initialState: State = {
  isOpen: false,
  orderId: undefined,
  accountId: undefined,
};

export const useNewTransaction = create<State & Actions>((set) => ({
  ...initialState,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set(initialState),
  setOrderId: (orderId: string) => set({ orderId }),
  setAccountId: (accountId: string) => set({ accountId }),
}));
