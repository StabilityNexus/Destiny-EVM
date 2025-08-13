import { NextRequest, NextResponse } from 'next/server';
// import PredictionGameABI from '@/contracts/abi/PredictionGame.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_GAME_CONTRACT || '';

export async function GET(
    request: NextRequest,
) {
    try {
        // const { address } = params;
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const contract = new ethers.Contract(CONTRACT_ADDRESS, PredictionGameABI.abi, provider);

        // This will be replaced with your actual contract call to get user's games
        const games = await Promise.resolve([
            {
                id: '1',
                pair: 'BTC/USD',
                isAbove: '68000.00',
                feed: 'BTC/USD',
                deadline: (new Date().getTime() + 86400000).toString(),
                bullCirculatingSupply: '50.00',
                bearCirculatingSupply: '50.00',
                isInitialized: true,
                baseAmountBull: '0.001',
                baseAmountBear: '0.001',
                start: new Date().getTime().toString(),
                contract: CONTRACT_ADDRESS
            },
            {
                id: '2',
                pair: 'BTC/USD',
                isAbove: '68000.00',
                feed: 'BTC/USD',
                deadline: (new Date().getTime() + 86400000).toString(),
                bullCirculatingSupply: '50.00',
                bearCirculatingSupply: '50.00',
                isInitialized: true,
                baseAmountBull: '0.001',
                baseAmountBear: '0.001',
                start: new Date().getTime().toString(),
                contract: CONTRACT_ADDRESS
            },
            {
                id: '3',
                pair: 'BTC/USD',
                isAbove: '68000.00',
                feed: 'BTC/USD',
                deadline: (new Date().getTime() + 86400000).toString(),
                bullCirculatingSupply: '50.00',
                bearCirculatingSupply: '50.00',
                isInitialized: true,
                baseAmountBull: '0.001',
                baseAmountBear: '0.001',
                start: new Date().getTime().toString(),
                contract: CONTRACT_ADDRESS
            },
            {
                id: '4',
                pair: 'BTC/USD',
                isAbove: '68000.00',
                feed: 'BTC/USD',
                deadline: (new Date().getTime() + 86400000).toString(),
                bullCirculatingSupply: '50.00',
                bearCirculatingSupply: '50.00',
                isInitialized: true,
                baseAmountBull: '0.001',
                baseAmountBear: '0.001',
                start: new Date().getTime().toString(),
                contract: CONTRACT_ADDRESS
            },
            {
                id: '5',
                pair: 'BTC/USD',
                isAbove: '68000.00',
                feed: 'BTC/USD',
                deadline: (new Date().getTime() + 86400000).toString(),
                bullCirculatingSupply: '50.00',
                bearCirculatingSupply: '50.00',
                isInitialized: true,
                baseAmountBull: '0.001',
                baseAmountBear: '0.001',
                start: new Date().getTime().toString(),
                contract: CONTRACT_ADDRESS
            },
            {
                id: '6',
                pair: 'BTC/USD',
                isAbove: '68000.00',
                feed: 'BTC/USD',
                deadline: (new Date().getTime() + 86400000).toString(),
                bullCirculatingSupply: '50.00',
                bearCirculatingSupply: '50.00',
                isInitialized: true,
                baseAmountBull: '0.001',
                baseAmountBear: '0.001',
                start: new Date().getTime().toString(),
                contract: CONTRACT_ADDRESS
            },
        ]);

        return NextResponse.json(games);
    } catch (error) {
        console.error('Error fetching user games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user games' },
            { status: 500 }
        );
    }
}
