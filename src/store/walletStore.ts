'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Address } from 'viem';

// You can customize this type if you want more in the future
type WalletState = {
  isConnected: boolean;
  address: Address | null;
  chainId: number | null;
  setConnection: (isConnected: boolean) => void;
  setAddress: (address: Address | null) => void;
  setChainId: (chainId: number | null) => void;
};

export const useWalletStore = create<WalletState>()(
  devtools((set) => ({
    isConnected: false,
    address: null,
    chainId: null,
    setConnection: (isConnected) => set({ isConnected }),
    setAddress: (address) => set({ address }),
    setChainId: (chainId) => set({ chainId }),
  }))
);
