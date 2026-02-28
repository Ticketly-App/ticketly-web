import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await req.json().catch(() => ({}))

  return NextResponse.json(
    {
      message:
        'Operator management is performed directly on-chain via the Ticketly dashboard. This API route is a stub to satisfy the app router.',
      id,
      body,
    },
    { status: 200 },
  )
}

