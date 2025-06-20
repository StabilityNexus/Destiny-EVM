"use client";

import { ChainNavigation } from "@/components/layout/ChainNavigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMetamaskStore } from "@/store/walletStore";

/**
 * Provides a layout for pages that conditionally renders content based on wallet connection status.
 *
 * If the user's wallet is not connected, displays a prompt to connect the wallet. Otherwise, renders navigation and the provided child components.
 *
 * @param children - The content to display within the layout when the wallet is connected
 */
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
