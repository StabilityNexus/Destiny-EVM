import { create } from 'zustand';

type FilterType = 'default' | 'bytimeup' | 'bytimedown' | 'byfeeup' | 'byfeedown' | 'byfinished';

interface GameState {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  filterGames: (games: any[]) => any[];
}

export const useGameStore = create<GameState>((set, get) => ({
  filter: 'default',
  setFilter: (filter) => set({ filter }),
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