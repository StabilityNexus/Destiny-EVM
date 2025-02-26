import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // const response = await fetch(
    //   'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    // );
    // const data = await response.json();
    
    // return NextResponse.json({
    //   price: data.ethereum.usd
    // });
    return NextResponse.json({
      price: 2500
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ETH price' },
      { status: 500 }
    );
  }
}