"use client";

import { ChainNavigation } from "@/components/layout/ChainNavigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMetamaskStore } from "@/store/walletStore";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isConnected, account } = useMetamaskStore();
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
          </CardHeader>
        </Card>
      </div>
    );
  }
  return (
    <html lang="en">
      <body>
        <ChainNavigation />
        {children}
      </body>
    </html>
  );
}
