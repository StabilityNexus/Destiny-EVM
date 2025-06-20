import { http, createConfig } from 'wagmi'
import { mainnet, polygon, sepolia } from 'wagmi/chains'

export const config = createConfig({
    chains: [sepolia, polygon, mainnet],
    transports: {
        // [mainnet.id]: http(),
        [sepolia.id]: http(),
        [polygon.id]: http(),
        [mainnet.id]: http(),
    },
})