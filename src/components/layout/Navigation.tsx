"use client";

import { useMetamaskStore } from "@/store/walletStore";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const { isConnected, connect, disconnect, account } = useMetamaskStore();

  return (
    <nav className="w-full px-4 sm:px-6 lg:px-8">
      <div
        className="flex justify-between items-center border-2 rounded-full p-4 my-4 md:px-8 
                      mx-auto max-w-[95%] sm:max-w-[90%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[30%]
                      bg-[#F9F6E6] shadow-lg"
      >
        <Link
          href="/"
          className="border-t-2 border-l-2 border-b-2 pb-1 rounded-xl pl-2 sm:pl-3 flex-shrink-0"
        >
          <p className="flex gap-1 sm:gap-3 font-extrabold text-lg sm:text-xl md:text-2xl items-center italic">
            FORECAST
            <span
              className="shadow px-1 sm:px-2 border-2 italic text-sm sm:text-base md:text-xl
                           bg-[#BAD8B6] rounded-xl transition-all hover:scale-105"
            >
              .BID
            </span>
          </p>
        </Link>

        <div className="flex-shrink-0">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden sm:inline">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 
                         transition-all hover:scale-105"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="bg-[#BAD8B6] text-black px-4 py-2 rounded-full hover:bg-[#9DC88E] 
                       transition-all hover:scale-105 font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
