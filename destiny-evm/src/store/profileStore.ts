import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Game {
  id: string;
  isAbove: string;
  feed: string;
  bullCirculatingSupply: string;
  bearCirculatingSupply: string;
  deadline: string;
  isInitialized: boolean;
  baseAmountBull: string;
  baseAmountBear: string;
  start: string;
  contract: string;
}

interface ProfileState {
  games: Game[];
  isLoading: boolean;
  fetchGames: (address: string) => Promise<void>;
  fetchGamesByPair: (pair: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      games: [],
      isLoading: false,
      fetchGames: async (address: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/game/get/${address}`);
          if (response.ok) {
            const data = await response.json();
            set({ games: data });
          }
        } catch (error) {
          console.error('Failed to fetch games:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      fetchGamesByPair: async (pair: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/game/${pair}`);
          if (response.ok) {
            const data = await response.json();
            set({ games: data });
          }
        } catch (error) {
          console.error('Failed to fetch games:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    })
  )
);