export interface Game {
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

export interface Position {
    bullCoins: number;
    bearCoins: number;
    totalAssets: number;
}

export interface Transaction {
    wallet: string;
    tx: string;
    type: 'MINT' | 'INITIALIZE' | 'BURN';
    token: 'BULL' | 'BEAR' | '-';
    amount: number;
    createdAt: string;
}

export interface GameState {
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
