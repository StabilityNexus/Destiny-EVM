"use client";

import { ChainNavigation } from "@/components/layout/ChainNavigation";
import { Navigation } from "@/components/layout/Navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSyncWallet } from "@/hooks/useSyncWallet";
import { useWalletStore } from "@/store/walletStore";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isConnected } = useWalletStore();
  useSyncWallet();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F6E6]">
        <Card className="w-[90%] max-w-md bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Wallet Not Connected
            </CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to view your profile
            </CardDescription>

            <div className="mt-6 flex justify-center">
              <ConnectButton showBalance={false} />
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      {children}
    </div>
  );
}
