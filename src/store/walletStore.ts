import { MetamaskState } from '@/types/wallet';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useMetamaskStore = create<MetamaskState>()(
  devtools(
    persist(
      (set) => ({
        isConnected: false,
        account: null,
        chainId: null,
        connect: async () => {
          if (typeof window !== 'undefined' && window.ethereum) {
            try {
              const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
              });
              const chainId = await window.ethereum.request({
                method: 'eth_chainId',
              });
              set({ isConnected: true, account: accounts[0], chainId });
            } catch (error) {
              console.error('Error connecting to MetaMask:', error);
            }
          }
        },
        disconnect: () => {
          set({ isConnected: false, account: null, chainId: null });
        },
      }),
      {
        name: 'metamask-storage',
      }
    )
  )
);