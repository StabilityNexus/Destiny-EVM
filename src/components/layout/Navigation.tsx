"use client";

import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import "@rainbow-me/rainbowkit/styles.css";

export const Navigation = () => {
  return (
    <nav className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center border-2 rounded-full p-3 my-4 md:px-6 mx-auto max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] bg-[#F9F6E6] shadow-lg">
        {/* Logo Section */}
        <Link
          href="/"
          className="border-t-2 border-l-2 border-b-2 pb-1 rounded-xl pl-2 sm:pl-3 flex-shrink-0"
        >
          <p className="flex gap-1 sm:gap-3 font-extrabold text-lg sm:text-xl md:text-2xl items-center italic">
            FORECAST
            <span className="shadow px-1 sm:px-2 border-2 italic text-sm sm:text-base md:text-xl bg-[#BAD8B6] rounded-xl transition-all hover:scale-105">
              .BID
            </span>
          </p>
        </Link>

        {/* Center Navigation - Hidden on small screens
        <div className="hidden lg:flex items-center space-x-6">
          <Link
            href="/markets"
            className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            Markets
          </Link>
          <Link
            href="/portfolio"
            className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            Portfolio
          </Link>
          <Link
            href="/create"
            className="bg-[#BAD8B6] text-black px-3 py-1 rounded-full hover:bg-[#9DC88E] transition-all hover:scale-105 font-medium text-sm"
          >
            + Create
          </Link>
        </div> */}

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile Create Button */}
          <Link
            href="/create"
            className="lg:hidden bg-[#BAD8B6] text-black px-2 py-1 rounded-full hover:bg-[#9DC88E] transition-all hover:scale-105 font-medium text-xs"
          >
            +
          </Link>
          
          {/* Connect Wallet */}
          <div className="connect-wallet-wrapper">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};