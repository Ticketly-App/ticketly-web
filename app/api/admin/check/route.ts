import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Server-only admin check.
 * The admin wallet is NEVER exposed to the client — comparison happens server-side.
 */
const ADMIN_WALLET = process.env.ADMIN_WALLET || ''

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet || !ADMIN_WALLET) {
    return NextResponse.json({ isAdmin: false })
  }
  return NextResponse.json({ isAdmin: wallet === ADMIN_WALLET })
}
