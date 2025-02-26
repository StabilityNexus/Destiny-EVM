import { create } from 'zustand';

interface ApiState {
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

export const useApiStore = create<ApiState>((set) => ({
  apiUrl: 'https://alph-destiny-testnet.phoenixfi.app',
  setApiUrl: (url: string) => set({ apiUrl: url }),
}));