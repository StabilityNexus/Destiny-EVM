import { http, createConfig } from 'wagmi'
import { mainnet, polygon, polygonAmoy, sepolia } from 'wagmi/chains'

export const config = createConfig({
    chains: [sepolia, polygonAmoy],
    transports: {
        // [mainnet.id]: http(),
        [sepolia.id]: http(),
        [polygonAmoy.id]: http(),
        // [polygon.id]: http(),
        // [mainnet.id]: http(),
    },
})