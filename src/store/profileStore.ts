import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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