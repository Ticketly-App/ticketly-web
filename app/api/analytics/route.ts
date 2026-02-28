import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      message: 'Ticketly analytics API placeholder. Core analytics are derived directly from on-chain data.',
    },
    { status: 200 },
  )
}

