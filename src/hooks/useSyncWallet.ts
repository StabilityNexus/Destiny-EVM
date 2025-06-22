'use client';

import { useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useWalletStore } from '@/store/walletStore';

/**
 * Synchronizes the current wallet connection state with the global wallet store.
 *
 * Updates the global store with the latest wallet connection status, address, and chain ID whenever they change.
 */
export function useSyncWallet() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    const setConnection = useWalletStore((s) => s.setConnection);
    const setAddress = useWalletStore((s) => s.setAddress);
    const setChainId = useWalletStore((s) => s.setChainId);

    useEffect(() => {
        setConnection(isConnected);
        setAddress(address ?? null);
        setChainId(chainId ?? null);
    }, [isConnected, address, chainId]);
}
