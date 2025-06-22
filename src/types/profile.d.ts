export interface ProfileState {
    games: Game[];
    isLoading: boolean;
    fetchGames: (address: string) => Promise<void>;
    fetchGamesByPair: (pair: string) => Promise<void>;
}