import { NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { TicketlyAccountsCoder, TicketlyProgramId } from '@/lib/ticketly/ticketly-program'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

// Parse BN values returned by Anchor's BorshAccountsCoder
function parseBnValue(val: any): number {
  if (val == null) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'bigint') return Number(val)
  // BN objects from bn.js have toNumber()
  if (typeof val.toNumber === 'function') return val.toNumber()
  return Number(val.toString()) || 0
}

// Cache on-chain stats for 60 seconds to avoid hammering RPC
let cachedStats: { data: any; fetchedAt: number } | null = null
const CACHE_TTL_MS = 60_000

export async function GET() {
  try {
    // Return cached data if fresh
    if (cachedStats && Date.now() - cachedStats.fetchedAt < CACHE_TTL_MS) {
      return NextResponse.json(cachedStats.data)
    }

    const connection = new Connection(RPC_URL, 'confirmed')

    // Fetch all EventAccount PDAs owned by the Ticketly program
    // The discriminator for EventAccount: [98, 136, 32, 165, 133, 231, 243, 154]
    const discriminator = Buffer.from([98, 136, 32, 165, 133, 231, 243, 154])

    const accounts = await connection.getProgramAccounts(TicketlyProgramId, {
      filters: [
        { memcmp: { offset: 0, bytes: discriminator.toString('base64'), encoding: 'base64' } },
      ],
    })

    let totalEvents = 0
    let totalTicketsSold = 0
    let totalRevenueLamports = 0
    let totalCheckins = 0

    for (const { account } of accounts) {
      try {
        const decoded = TicketlyAccountsCoder.decode('EventAccount', account.data) as any

        // Skip cancelled events (fields are snake_case from Borsh)
        if (decoded.is_cancelled) continue

        totalEvents++

        // BN values from Anchor come as hex strings — parse them
        totalTicketsSold += parseBnValue(decoded.total_minted)
        totalRevenueLamports += parseBnValue(decoded.total_revenue)
        totalCheckins += parseBnValue(decoded.total_checked_in)
      } catch {
        // Skip accounts that fail to decode
      }
    }

    const totalRevenueSol = totalRevenueLamports / 1_000_000_000

    const data = {
      totalEvents,
      totalTicketsSold,
      totalRevenueLamports,
      totalRevenueSol,
      totalCheckins,
    }

    cachedStats = { data, fetchedAt: Date.now() }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Stats API error (on-chain):', error)
    return NextResponse.json({
      totalEvents: 0,
      totalTicketsSold: 0,
      totalRevenueLamports: 0,
      totalRevenueSol: 0,
      totalCheckins: 0,
    })
  }
}
