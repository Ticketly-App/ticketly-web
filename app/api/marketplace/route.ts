import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      message:
        'Marketplace data is sourced directly from the on-chain Ticketly program on Solana devnet. This API exists for compatibility.',
    },
    { status: 200 },
  )
}

