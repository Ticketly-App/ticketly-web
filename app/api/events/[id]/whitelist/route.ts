import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await req.json().catch(() => ({}))

  return NextResponse.json(
    {
      message:
        'Whitelist management is handled directly on-chain via the Ticketly dashboard. This API route is a stub for compatibility.',
      id,
      body,
    },
    { status: 200 },
  )
}

