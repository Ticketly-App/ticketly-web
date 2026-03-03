import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { WalletBindingModel } from '@/lib/db/models'

export const dynamic = 'force-dynamic'

const ADMIN_WALLET = process.env.ADMIN_WALLET

function isAdmin(wallet: string | null) {
  return !!ADMIN_WALLET && wallet === ADMIN_WALLET
}

/**
 * GET /api/admin/bindings?wallet=<ADMIN_WALLET>
 * Lists all wallet↔X bindings (admin only)
 */
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!isAdmin(wallet)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const bindings = await WalletBindingModel.find().sort({ boundAt: -1 }).lean()
  return NextResponse.json({ bindings })
}

/**
 * DELETE /api/admin/bindings?wallet=<ADMIN_WALLET>
 * Body: { bindingId?: string, twitterId?: string, targetWallet?: string }
 * Deletes a specific binding by ID, twitterId, or wallet (admin only)
 */
export async function DELETE(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!isAdmin(wallet)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bindingId, twitterId, targetWallet } = await req.json()

  if (!bindingId && !twitterId && !targetWallet) {
    return NextResponse.json({ error: 'Provide bindingId, twitterId, or targetWallet' }, { status: 400 })
  }

  await connectDB()

  const filter: any = {}
  if (bindingId) filter._id = bindingId
  if (twitterId) filter.twitterId = twitterId
  if (targetWallet) filter.wallet = targetWallet

  const result = await WalletBindingModel.deleteMany(filter)
  return NextResponse.json({ deleted: result.deletedCount })
}
