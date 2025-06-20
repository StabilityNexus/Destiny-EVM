"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/walletConfig";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "viem/chains";
import { useSyncWallet } from "@/hooks/useSyncWallet";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider initialChain={sepolia}>
          {children}
          <Toaster />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
