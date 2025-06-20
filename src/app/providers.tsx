"use client";

import { useEffect } from "react";
import { useMetamaskStore } from "@/store/walletStore";

/**
 * Wraps child components with application-wide providers.
 *
 * This component currently renders its children directly. It is intended as a place to add context providers or global logic for the application.
 *
 * @param children - The React nodes to be rendered within the providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const { connect } = useMetamaskStore();

  //   useEffect(() => {
  //     // Try to connect to MetaMask on initial load if previously connected
  //     connect();
  //   }, [connect]);

  return <>{children}</>;
}
