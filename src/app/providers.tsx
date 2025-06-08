"use client";

import { useEffect } from "react";
import { useMetamaskStore } from "@/store/walletStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const { connect } = useMetamaskStore();

  //   useEffect(() => {
  //     // Try to connect to MetaMask on initial load if previously connected
  //     connect();
  //   }, [connect]);

  return <>{children}</>;
}
