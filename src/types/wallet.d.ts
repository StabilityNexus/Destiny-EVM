export interface MetamaskState {
    isConnected: boolean;
    account: string | null;
    chainId: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}
