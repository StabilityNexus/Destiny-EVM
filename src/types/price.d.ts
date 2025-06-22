export interface PriceState {
    btcPrice: number | null;
    ethPrice: number | null;
    fetchPrices: () => Promise<void>;
}