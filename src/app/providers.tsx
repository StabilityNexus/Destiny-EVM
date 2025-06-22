"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/walletConfig";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "viem/chains";
import { useSyncWallet } from "@/hooks/useSyncWallet";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

/**
 * Wraps child components with context providers for React Query, wallet management, blockchain interaction, and toast notifications.
 *
 * Renders the provided children within a hierarchy of providers, enabling query caching, wallet connectivity, blockchain selection, and toast support throughout the component tree.
 *
 * @param children - The React elements to be rendered within the provider context
 */
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
