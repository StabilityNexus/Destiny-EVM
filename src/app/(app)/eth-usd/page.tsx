'use client';

import { useState, useEffect } from 'react';
import { TradingViewWidget } from '@/components/graph/TradingViewWidget';
import { usePriceStore } from '@/store/priceStore';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// import { Skeleton } from "@/components/ui/skeleton";


export default function ETHUSDPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { ethPrice, fetchPrices } = usePriceStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchPrices]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 md:px-80 w-full justify-center items-center h-screen animate-pulse">
        <Skeleton className="h-16 w-16 rounded-full bg-[#BAD8B6]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64 w-full max-w-[1920px] mx-auto justify-center animate-fade-in">
      <Card className="p-4 bg-[#F9F6E6]/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">ETH/USD Price: ${ethPrice?.toLocaleString()}</h2>
        <TradingViewWidget symbol="ETHUSD" />
      </Card>
    </div>
  );
}