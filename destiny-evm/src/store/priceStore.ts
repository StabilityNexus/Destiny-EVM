import { create } from 'zustand';

interface PriceState {
  btcPrice: number | null;
  ethPrice: number | null;
  fetchPrices: () => Promise<void>;
}

export const usePriceStore = create<PriceState>()((set) => ({
  btcPrice: null,
  ethPrice: null,
  fetchPrices: async () => {
    try {
      const [btcResponse, ethResponse] = await Promise.all([
        fetch('/api/price/btc'),
        fetch('/api/price/eth')
      ]);
      
      const btcData = await btcResponse.json();
      const ethData = await ethResponse.json();
      
      set({
        btcPrice: btcData.price,
        ethPrice: ethData.price
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }
}));