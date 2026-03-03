import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { WalletBindingModel } from '@/lib/db/models'

export const dynamic = 'force-dynamic'

/**
 * POST /api/profiles/by-wallets
 * Body: { wallets: string[] }
 * Returns: { profiles: Record<string, { handle: string }> }
 *
 * Batch-lookup Twitter handles for a list of wallet addresses.
 */
export async function POST(req: NextRequest) {
  try {
    const { wallets } = await req.json()
    if (!Array.isArray(wallets) || wallets.length === 0) {
      return NextResponse.json({ profiles: {} })
    }

    // Limit to 50 wallets per request
    const uniqueWallets = [...new Set(wallets as string[])].slice(0, 50)

    await connectDB()
    const bindings = await WalletBindingModel.find({ wallet: { $in: uniqueWallets } })
      .select('wallet twitterHandle')
      .lean()

    const profiles: Record<string, { handle: string }> = {}
    for (const b of bindings) {
      profiles[b.wallet] = { handle: b.twitterHandle }
    }

    return NextResponse.json({ profiles })
  } catch (err) {
    console.error('Profiles by-wallets error:', err)
    return NextResponse.json({ profiles: {} })
  }
}
