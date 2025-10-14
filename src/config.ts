export const DEFAULT_CHAIN = 'sepolia' as const;

export const SUPPORTED_CHAINS = ['sepolia', 'mainnet', 'polygon'] as const;
export type SupportedChain = typeof SUPPORTED_CHAINS[number];

export const CHAIN_IDS: Record<SupportedChain, number> = {
    sepolia: 11155111,
    mainnet: 1,
    polygon: 137,
};

export const RPC_URLS: Record<SupportedChain, string> = {
    sepolia: 'https://ethereum-sepolia-rpc.publicnode.com',
    mainnet: 'https://eth.blockrazor.xyz',
    polygon: 'https://polygon-rpc.com',
};

export const BLOCK_EXPLORERS: Record<SupportedChain, string> = {
    sepolia: 'https://sepolia.etherscan.io',
    mainnet: 'https://etherscan.io',
    polygon: 'https://polygonscan.com',
};

export const NATIVE_TOKENS: Record<SupportedChain, string> = {
    sepolia: 'ETH',
    mainnet: 'ETH',
    polygon: 'MATIC',
};

export const FACTORY_ADDRESSES = {
    sepolia: '0x27F0445e9A28eeF757d132f5257dd994Ff06fB54',
    amoy: '0xeFD22a59Cd56A220a275824D84a8520C5A44671A'
}