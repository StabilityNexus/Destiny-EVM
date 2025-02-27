import { create } from 'zustand';

type FilterType = 'default' | 'bytimeup' | 'bytimedown' | 'byfeeup' | 'byfeedown' | 'byfinished';

interface Position {
  bullCoins: number;
  bearCoins: number;
  totalAssets: number;
}

interface Game {
  id: string;
  pair: string;
  isAbove: string;
  feed: string;
  deadline: string;
  bullCirculatingSupply: string;
  bearCirculatingSupply: string;
  isInitialized: boolean;
  baseAmountBull: string;
  baseAmountBear: string;
  start: string;
  contract: string;
  creator: string;
}

interface Transaction {
  wallet: string;
  tx: string;
  type: 'MINT' | 'INITIALIZE' | 'BURN';
  token: 'BULL' | 'BEAR' | '-';
  amount: number;
  createdAt: string;
}

interface GameState {
  filter: FilterType;
  currentGame: Game | null;
  userPosition: Position | null;
  transactions: Transaction[];
  setFilter: (filter: FilterType) => void;
  setCurrentGame: (game: Game | null) => void;
  setUserPosition: (position: Position | null) => void;
  filterGames: (games: Game[]) => Game[];
  fetchGameById: (id: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  filter: 'default',
  currentGame: null,
  userPosition: null,
  transactions: [],
  setFilter: (filter) => set({ filter }),
  setCurrentGame: (game) => set({ currentGame: game }),
  setUserPosition: (position) => set({ userPosition: position }),
  filterGames: (games) => {
    const filter = get().filter;
    const now = new Date().getTime();
    const activeGames = games.filter(
      (game) => new Date(parseInt(game.deadline)).getTime() > now
    );
    const closedGames = games.filter(
      (game) => new Date(parseInt(game.deadline)).getTime() <= now
    );

    switch (filter) {
      case 'bytimeup':
        return activeGames.sort((a, b) => {
          const timeLeftA = new Date(parseInt(a.deadline)).getTime() - now;
          const timeLeftB = new Date(parseInt(b.deadline)).getTime() - now;
          return timeLeftA - timeLeftB;
        });
      case 'bytimedown':
        return activeGames.sort((a, b) => {
          const timeLeftA = new Date(parseInt(a.deadline)).getTime() - now;
          const timeLeftB = new Date(parseInt(b.deadline)).getTime() - now;
          return timeLeftB - timeLeftA;
        });
      case 'byfeeup':
        return activeGames.sort((a, b) => {
          const feeA = calculateProgressiveFee(a.start, a.deadline);
          const feeB = calculateProgressiveFee(b.start, b.deadline);
          return feeA - feeB;
        });
      case 'byfeedown':
        return activeGames.sort((a, b) => {
          const feeA = calculateProgressiveFee(a.start, a.deadline);
          const feeB = calculateProgressiveFee(b.start, b.deadline);
          return feeB - feeA;
        });
      case 'byfinished':
        return closedGames.sort((a, b) =>
          new Date(parseInt(a.deadline)).getTime() - new Date(parseInt(b.deadline)).getTime()
        );
      default:
        return [
          ...activeGames.sort((a, b) =>
            new Date(parseInt(a.deadline)).getTime() - new Date(parseInt(b.deadline)).getTime()
          ),
          ...closedGames
        ];
    }
  },
  fetchGameById: async (id: string) => {
    try {
      const response = await fetch(`/api/game/getid/${id}`);
      if (response.ok) {
        const game = await response.json();
        set({
          currentGame: game,
          userPosition: {
            bullCoins: 10.00,
            bearCoins: 15.00,
          totalAssets: 25.00
          },
          transactions: [
            {
              wallet: "1Aqzj_t56h",
              tx: "0x8f2b1b_fc77",
              type: "MINT",
              token: "BULL",
              amount: 10.00,
              createdAt: "0 minutes ago"
            },
            {
              wallet: "1Aqzj_t56h",
              tx: "exfbf66e_11e1",
              type: "INITIALIZE",
              token: "-",
              amount: 0,
              createdAt: "1 minutes ago"
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  }
}));





function calculateProgressiveFee(start: string, deadline: string): number {
  const startTime = parseInt(start);
  const deadlineTime = parseInt(deadline);
  const now = new Date().getTime();
  const totalDuration = deadlineTime - startTime;
  const elapsed = now - startTime;
  return Math.min(100, (elapsed / totalDuration) * 100);
}