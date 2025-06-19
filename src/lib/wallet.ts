import { createPublicClient, http } from 'viem';
import { goerli, mainnet, polygon, sepolia } from 'viem/chains';

export const RPC = {
    goerli: 'https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    ethereum_mainnet: 'https://eth.blockrazor.xyz',
    polygon: 'https://polygon-rpc.com'
}

export const publicClients = {
    goerli: createPublicClient({
        chain: goerli,
        transport: http(RPC.goerli)
    }),
    mainnet: createPublicClient({
        chain: mainnet,
        transport: http(RPC.ethereum_mainnet)
    }),
    polygon: createPublicClient({
        chain: polygon,
        transport: http(RPC.polygon)
    }),
    sepolia: createPublicClient({
        chain: sepolia,
        transport: http(sepolia.rpcUrls.default.http[0])
    })
}

// Export default sepolia for now
export const getPublicClient = publicClients.sepolia;
