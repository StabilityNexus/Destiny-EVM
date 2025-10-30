"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

export const Navigation = () => {
  return (
    <nav className="w-full px-3 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center border-2 rounded-full p-2 sm:p-3 my-3 sm:my-4 md:px-6 mx-auto max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] bg-[#F9F6E6] shadow-lg">
        {/* Logo Section */}
        <Link
          href="/"
          className="border-t-2 border-l-2 border-b-2 pb-1 rounded-xl pl-2 flex-shrink-0"
        >
          <p className="flex gap-1 sm:gap-2 font-extrabold text-base sm:text-xl md:text-2xl items-center italic">
            FORECAST
            <span className="shadow px-1 sm:px-2 border-2 italic text-xs sm:text-base md:text-xl bg-[#BAD8B6] rounded-xl transition-all hover:scale-105">
              .BID
            </span>
          </p>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobile Create Button */}
          <Link
            href="/app/create"
            className="bg-[#BAD8B6] text-black px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-[#9DC88E] transition-all hover:scale-105 font-bold text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">+</span>
            <span className="sm:hidden text-lg">+</span>
          </Link>

          {/* Connect Wallet */}
          <div className="connect-wallet-wrapper scale-90 sm:scale-100 origin-right">
            <ConnectButton
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
