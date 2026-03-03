import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { WalletBindingModel } from '@/lib/db/models'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/bind-wallet
 *
 * Enforces 1:1 mapping between Solana wallets and X (Twitter) accounts.
 * - If the wallet+twitter pair already exists → success (already bound)
 * - If the twitterId is bound to a DIFFERENT wallet → error (with option to force)
 * - If the wallet is bound to a DIFFERENT twitterId → error (with option to force)
 * - If `force: true` is sent → delete old bindings and create new one
 * - Otherwise → create new binding
 */
export async function POST(req: NextRequest) {
  try {
    const { wallet, twitterId, twitterHandle, force } = await req.json()

    if (!wallet || !twitterId) {
      return NextResponse.json({ error: 'Missing wallet or twitterId' }, { status: 400 })
    }

    await connectDB()

    // Check if this exact pair already exists
    const existingBinding = await WalletBindingModel.findOne({ wallet, twitterId })
    if (existingBinding) {
      // Update handle if changed
      if (existingBinding.twitterHandle !== twitterHandle) {
        existingBinding.twitterHandle = twitterHandle
        await existingBinding.save()
      }
      return NextResponse.json({ status: 'bound', wallet, twitterId })
    }

    // Check for conflicts
    const twitterBound = await WalletBindingModel.findOne({ twitterId })
    const walletBound = await WalletBindingModel.findOne({ wallet })

    if (twitterBound || walletBound) {
      // If force flag is set, remove old bindings and create new one
      if (force) {
        await WalletBindingModel.deleteMany({
          $or: [{ twitterId }, { wallet }],
        })
        await WalletBindingModel.create({
          wallet,
          twitterId,
          twitterHandle: twitterHandle || '',
        })
        return NextResponse.json({ status: 'rebound', wallet, twitterId })
      }

      // Return conflict info
      if (twitterBound) {
        const maskedWallet = twitterBound.wallet.slice(0, 4) + '...' + twitterBound.wallet.slice(-4)
        return NextResponse.json({
          error: 'twitter_already_bound',
          message: `This X account (@${twitterHandle}) is already linked to wallet ${maskedWallet}. Each X account can only be linked to one wallet.`,
          boundWallet: maskedWallet,
        }, { status: 409 })
      }

      if (walletBound) {
        return NextResponse.json({
          error: 'wallet_already_bound',
          message: `This wallet is already linked to @${walletBound.twitterHandle}. Each wallet can only be linked to one X account.`,
          boundHandle: walletBound.twitterHandle,
        }, { status: 409 })
      }
    }

    // Create new binding
    await WalletBindingModel.create({
      wallet,
      twitterId,
      twitterHandle: twitterHandle || '',
    })

    return NextResponse.json({ status: 'bound', wallet, twitterId })
  } catch (err: any) {
    // Handle MongoDB duplicate key errors (race condition safety)
    if (err.code === 11000) {
      return NextResponse.json({
        error: 'binding_conflict',
        message: 'This wallet or X account is already linked to another account.',
      }, { status: 409 })
    }
    console.error('Bind wallet error:', err)
    return NextResponse.json({ error: 'db_unavailable', message: 'Database temporarily unavailable. Please try again later.' }, { status: 503 })
  }
}
