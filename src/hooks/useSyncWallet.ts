'use client';

import { useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useWalletStore } from '@/store/walletStore';

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
