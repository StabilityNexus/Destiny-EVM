'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const gamesOracle = [
  { pair: 'ALPH/USD', page: '/alph-usd', mobilePair: 'ALPH/USD' },
  { pair: 'BTC/USD', page: '/btc-usd', mobilePair: 'BTC/USD' },
  { pair: 'ETH/USD', page: '/eth-usd', mobilePair: 'ETH/USD' }
];

export const ChainNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const activeIndex = gamesOracle.findIndex((game) => game.page === pathname);

  const toggleChain = (index: number) => {
    router.push(gamesOracle[index].page);
  };

  return (
    <>
      {/* Desktop Chain Menu */}
      <div className="hidden md:flex justify-center my-8 w-full px-[35vw]">
        {gamesOracle.map((game, index) => (
          <button
            key={game.pair}
            className={cn(
              "flex-grow px-4 bg-[#F9F6E6] border-2 py-2 text-center font-bold transition-all",
              index === 0 && "rounded-l-2xl",
              index === gamesOracle.length - 1 && "rounded-r-2xl",
              activeIndex === index 
                ? "translate-x-1 translate-y-1 shadow-none bg-[#BAD8B6]" 
                : "hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            )}
            onClick={() => toggleChain(index)}
          >
            {game.pair}
          </button>
        ))}
      </div>

      {/* Mobile Chain Menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around bg-[#F9F6E6] border-t-2 z-50">
        {gamesOracle.map((game, index) => (
          <button
            key={game.pair}
            className={cn(
              "flex-grow px-4 py-4 text-center font-semibold transition-all",
              activeIndex === index 
                ? "translate-x-1 translate-y-1 shadow-none bg-[#BAD8B6]" 
                : "hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            )}
            onClick={() => toggleChain(index)}
          >
            {game.mobilePair}
          </button>
        ))}
      </div>
    </>
  );
};