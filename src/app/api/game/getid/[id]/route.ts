import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    {params}: {params: {id: string}}
) {
    try {
        const { id } = params;
        console.log(id);
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_GAME_CONTRACT || '';
        
        const game = await Promise.resolve({
            id: id,
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
        })
        
        return new NextResponse(JSON.stringify(game), {status: 200});
    } catch (error) {
        return new NextResponse("Internal Server Error", {status: 500});
    }
}
