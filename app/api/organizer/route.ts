import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      message:
        'Organizer profile is derived from the connected wallet and on-chain organizer account. This API endpoint is a stub.',
    },
    { status: 200 },
  )
}

