import { PriceState } from '@/types/price';
import { create } from 'zustand';

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