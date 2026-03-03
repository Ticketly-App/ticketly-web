import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { TicketlyAccountsCoder, TicketlyProgramId } from '@/lib/ticketly/ticketly-program'
import { connectDB } from '@/lib/db/client'
import { EventModel, TicketModel, AnalyticsEventModel, ListingModel, OrganizerModel } from '@/lib/db/models'

export const dynamic = 'force-dynamic'

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
const ADMIN_WALLET = process.env.ADMIN_WALLET || ''

function parseBn(val: any): number {
  if (val == null) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'bigint') return Number(val)
  if (typeof val.toNumber === 'function') return val.toNumber()
  return Number(val.toString()) || 0
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet || wallet !== ADMIN_WALLET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const [onChainData, dbData] = await Promise.all([
      fetchOnChainData(),
      fetchDbData(),
    ])
    return NextResponse.json({ ...onChainData, ...dbData })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function fetchOnChainData() {
  const connection = new Connection(RPC_URL, 'confirmed')

  // Discriminators
  const eventDisc = Buffer.from([98, 136, 32, 165, 133, 231, 243, 154])
  const ticketDisc = Buffer.from([133, 117, 202, 150, 44, 154, 220, 231])
  const organizerDisc = Buffer.from([216, 88, 24, 216, 45, 218, 209, 79])

  // Parallel fetch all account types
  const [eventAccounts, ticketAccountsRaw, organizerAccountsRaw] = await Promise.all([
    connection.getProgramAccounts(TicketlyProgramId, {
      filters: [{ memcmp: { offset: 0, bytes: eventDisc.toString('base64'), encoding: 'base64' } }],
    }),
    connection.getProgramAccounts(TicketlyProgramId, {
      filters: [{ memcmp: { offset: 0, bytes: ticketDisc.toString('base64'), encoding: 'base64' } }],
    }).catch(() => [] as readonly any[]),
    connection.getProgramAccounts(TicketlyProgramId, {
      filters: [{ memcmp: { offset: 0, bytes: organizerDisc.toString('base64'), encoding: 'base64' } }],
    }).catch(() => [] as readonly any[]),
  ])

  // ── Parse OrganizerProfile accounts ──
  const organizers: any[] = []
  for (const { pubkey, account } of organizerAccountsRaw) {
    try {
      const d = TicketlyAccountsCoder.decode('OrganizerProfile', account.data) as any
      const authority = d.authority?.toBase58?.() || ''
      const website = d.website || ''
      // Extract X handle from website field
      let xHandle: string | null = null
      if (website) {
        const xMatch = website.match(/(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/i)
        if (xMatch) {
          xHandle = xMatch[1]
        } else if (!website.includes('://') && !website.includes('.') && /^@?[A-Za-z0-9_]{1,15}$/.test(website.replace(/^@/, ''))) {
          xHandle = website.replace(/^@/, '')
        }
      }
      organizers.push({
        pubkey: pubkey.toBase58(),
        authority,
        name: d.name || '',
        website,
        logoUri: d.logo_uri || d.logoUri || '',
        xHandle,
        totalEvents: parseBn(d.total_events ?? d.totalEvents),
        totalTickets: parseBn(d.total_tickets ?? d.totalTickets),
        totalRevenue: parseBn(d.total_revenue ?? d.totalRevenue),
      })
    } catch { /* skip */ }
  }

  // ── Parse events ──
  const events: any[] = []
  let totalRevenueLamports = 0
  let totalTicketsSold = 0
  let totalCheckins = 0
  let totalSupply = 0
  let cancelledEvents = 0
  let freeEvents = 0
  let paidEvents = 0
  let totalRoyalties = 0
  const organizerMap = new Map<string, { events: number; revenue: number; tickets: number }>()
  const venueMap = new Map<string, number>()

  for (const { pubkey, account } of eventAccounts) {
    try {
      const decoded = TicketlyAccountsCoder.decode('EventAccount', account.data) as any
      const isCancelled = decoded.is_cancelled ?? false
      if (isCancelled) { cancelledEvents++; continue }

      const revenue = parseBn(decoded.total_revenue)
      const minted = parseBn(decoded.total_minted)
      const checkins = parseBn(decoded.total_checked_in)
      const authority = decoded.authority?.toBase58?.() || ''
      const eventStart = parseBn(decoded.event_start) * 1000
      const eventEnd = parseBn(decoded.event_end) * 1000
      const royalties = parseBn(decoded.total_royalties)
      const royaltyBps = parseBn(decoded.royalty_bps)

      totalRevenueLamports += revenue
      totalTicketsSold += minted
      totalCheckins += checkins
      totalRoyalties += royalties

      const tiers = (decoded.ticket_tiers || []).map((t: any, idx: number) => ({
        index: idx,
        tierType: parseBn(t.tier_type),
        price: parseBn(t.price),
        supply: parseBn(t.supply),
        minted: parseBn(t.minted),
      }))

      const eventSupply = tiers.reduce((s: number, t: any) => s + t.supply, 0)
      totalSupply += eventSupply

      // Free vs paid
      const avgPrice = tiers.length > 0 ? tiers.reduce((s: number, t: any) => s + t.price, 0) / tiers.length : 0
      if (avgPrice === 0) freeEvents++; else paidEvents++

      const venue = decoded.venue || ''
      if (venue) venueMap.set(venue, (venueMap.get(venue) || 0) + 1)

      // Determine event time status
      const now = Date.now()
      let timeStatus: 'upcoming' | 'live' | 'past' = 'upcoming'
      if (eventStart && eventEnd) {
        if (now >= eventStart && now <= eventEnd) timeStatus = 'live'
        else if (now > eventEnd) timeStatus = 'past'
      }

      events.push({
        pubkey: pubkey.toBase58(),
        name: decoded.name || 'Unnamed',
        authority,
        venue,
        eventStart,
        eventEnd,
        totalMinted: minted,
        totalRevenue: revenue,
        totalCheckins: checkins,
        totalSupply: eventSupply,
        isActive: decoded.is_active ?? true,
        tiers,
        symbol: decoded.symbol || '',
        resaleAllowed: decoded.resale_allowed ?? false,
        royaltyBps,
        totalRoyalties: royalties,
        whitelistGated: decoded.whitelist_gated ?? false,
        poapEnabled: decoded.poap_enabled ?? false,
        totalPoapsMinted: parseBn(decoded.total_poaps_minted),
        gateOperators: (decoded.gate_operators || []).length,
        timeStatus,
      })

      if (authority) {
        const existing = organizerMap.get(authority) || { events: 0, revenue: 0, tickets: 0 }
        existing.events += 1
        existing.revenue += revenue
        existing.tickets += minted
        organizerMap.set(authority, existing)
      }
    } catch { /* skip bad accounts */ }
  }

  // ── Parse tickets ──
  const uniqueOwners = new Set<string>()
  const uniqueBuyers = new Set<string>()
  const recentTickets: any[] = []
  let totalListedOnChain = 0
  let totalCheckedInTickets = 0
  let totalPoapMinted = 0
  const ownerTicketCount = new Map<string, number>()
  const tierDistribution = new Map<number, number>()

  for (const { pubkey, account: acc } of ticketAccountsRaw) {
    try {
      const decoded = TicketlyAccountsCoder.decode('TicketAccount', acc.data) as any
      const owner = decoded.owner?.toBase58?.() || ''
      const originalBuyer = decoded.original_buyer?.toBase58?.() || decoded.originalBuyer?.toBase58?.() || ''
      if (owner) {
        uniqueOwners.add(owner)
        ownerTicketCount.set(owner, (ownerTicketCount.get(owner) || 0) + 1)
      }
      if (originalBuyer) uniqueBuyers.add(originalBuyer)
      const mintedAt = parseBn(decoded.minted_at) * 1000
      const isCheckedIn = decoded.is_checked_in ?? false
      const isListed = decoded.is_listed ?? false
      const poapMinted = decoded.poap_minted ?? false
      const tierIndex = parseBn(decoded.tier_index)
      const resaleCount = parseBn(decoded.resale_count)
      const transferCount = parseBn(decoded.transfer_count)

      if (isCheckedIn) totalCheckedInTickets++
      if (isListed) totalListedOnChain++
      if (poapMinted) totalPoapMinted++
      tierDistribution.set(tierIndex, (tierDistribution.get(tierIndex) || 0) + 1)

      recentTickets.push({
        pubkey: pubkey.toBase58(),
        owner,
        originalBuyer,
        event: decoded.event?.toBase58?.() || '',
        tierIndex,
        pricePaid: parseBn(decoded.price_paid),
        isCheckedIn,
        isListed,
        poapMinted,
        mintedAt,
        resaleCount,
        transferCount,
      })
    } catch { /* skip */ }
  }

  // Sort events by revenue desc
  events.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)

  // Top organizers from on-chain
  const topOrganizers = [...organizerMap.entries()]
    .map(([address, data]) => {
      const profile = organizers.find(o => o.authority === address)
      return { address, ...data, name: profile?.name || '', xHandle: profile?.xHandle || null, logoUri: profile?.logoUri || '' }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Sales timeline from tickets
  const salesByDay = new Map<string, { count: number; revenue: number }>()
  for (const t of recentTickets) {
    if (!t.mintedAt) continue
    const day = new Date(t.mintedAt).toISOString().split('T')[0]
    const existing = salesByDay.get(day) || { count: 0, revenue: 0 }
    existing.count += 1
    existing.revenue += t.pricePaid
    salesByDay.set(day, existing)
  }
  const salesTimeline = [...salesByDay.entries()]
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)

  // Owner distribution brackets
  const ticketCounts = [...ownerTicketCount.values()]
  const ownerBrackets = {
    '1 ticket': ticketCounts.filter(c => c === 1).length,
    '2-5 tickets': ticketCounts.filter(c => c >= 2 && c <= 5).length,
    '6-10 tickets': ticketCounts.filter(c => c >= 6 && c <= 10).length,
    '10+ tickets': ticketCounts.filter(c => c > 10).length,
  }

  // Top venues
  const topVenues = [...venueMap.entries()]
    .map(([venue, count]) => ({ venue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Tier distribution for chart
  const tierTypes = ['GA', 'Early Bird', 'VIP', 'VVIP', 'Custom']
  const tierDistData = [...tierDistribution.entries()]
    .map(([idx, count]) => ({ name: tierTypes[idx] || `Tier ${idx}`, value: count }))
    .sort((a, b) => b.value - a.value)

  // Check-in rate, sell-through, avg price
  const totalTicketAccounts = ticketAccountsRaw.length
  const checkinRate = totalTicketAccounts > 0 ? (totalCheckedInTickets / totalTicketAccounts * 100) : 0
  const sellThroughRate = totalSupply > 0 ? (totalTicketsSold / totalSupply * 100) : 0
  const avgTicketPrice = totalTicketsSold > 0 ? totalRevenueLamports / totalTicketsSold : 0

  return {
    onChain: {
      totalEvents: events.length,
      cancelledEvents,
      totalTicketsSold,
      totalRevenueLamports,
      totalRevenueSol: totalRevenueLamports / 1_000_000_000,
      totalCheckins,
      totalUniqueOwners: uniqueOwners.size,
      totalUniqueBuyers: uniqueBuyers.size,
      totalTicketAccounts,
      totalSupply,
      totalListedOnChain,
      totalCheckedInTickets,
      totalPoapMinted,
      totalRoyalties,
      totalRoyaltiesSol: totalRoyalties / 1_000_000_000,
      checkinRate: +checkinRate.toFixed(1),
      sellThroughRate: +sellThroughRate.toFixed(1),
      avgTicketPrice,
      avgTicketPriceSol: avgTicketPrice / 1_000_000_000,
      freeEvents,
      paidEvents,
      // Organizer profiles
      totalOrganizers: organizers.length,
      organizersWithX: organizers.filter(o => o.xHandle).length,
      organizers,
      // Computed
      events,
      topOrganizers,
      salesTimeline,
      ownerBrackets,
      topVenues,
      tierDistribution: tierDistData,
      recentTickets: recentTickets
        .sort((a, b) => b.mintedAt - a.mintedAt)
        .slice(0, 30),
      // All unique wallet addresses (users)
      allUsers: [...uniqueOwners].map(addr => ({
        address: addr,
        tickets: ownerTicketCount.get(addr) || 0,
      })).sort((a, b) => b.tickets - a.tickets),
    },
  }
}

async function fetchDbData() {
  try {
    await connectDB()

    const [
      dbEventCount,
      dbTicketCount,
      dbListingCount,
      dbActiveListings,
      dbOrganizerCount,
      recentAnalytics,
      ticketsByEvent,
      topBuyers,
      dbOrganizers,
      recentEvents,
      // Marketplace volume
      marketplaceVolume,
    ] = await Promise.all([
      EventModel.countDocuments(),
      TicketModel.countDocuments(),
      ListingModel.countDocuments(),
      ListingModel.countDocuments({ isActive: true }),
      OrganizerModel.countDocuments(),
      AnalyticsEventModel.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean(),
      TicketModel.aggregate([
        { $group: { _id: '$eventPubkey', count: { $sum: 1 }, totalSpent: { $sum: '$purchasePrice' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      TicketModel.aggregate([
        { $group: { _id: '$owner', ticketsBought: { $sum: 1 }, totalSpent: { $sum: '$purchasePrice' } } },
        { $sort: { ticketsBought: -1 } },
        { $limit: 10 },
      ]),
      OrganizerModel.find().select('name authority twitter website pubkey imageUri verified').lean(),
      EventModel.find().sort({ createdAt: -1 }).limit(10).select('pubkey name organizer organizerWallet status createdAt imageUri totalTicketsSold totalRevenue venue').lean(),
      ListingModel.aggregate([
        { $match: { isActive: false } },
        { $group: { _id: null, volume: { $sum: '$price' }, count: { $sum: 1 } } },
      ]),
    ])

    // Analytics event type distribution
    const analyticsTypes = await AnalyticsEventModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Unique wallets from tickets (DB perspective)
    const uniqueWallets = await TicketModel.distinct('owner')

    // Event creation timeline (events by month)
    const eventTimeline = await EventModel.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ])

    return {
      db: {
        eventCount: dbEventCount,
        ticketCount: dbTicketCount,
        listingCount: dbListingCount,
        activeListings: dbActiveListings,
        organizerCount: dbOrganizerCount,
        uniqueWallets: uniqueWallets.length,
        recentAnalytics,
        ticketsByEvent,
        topBuyers,
        analyticsTypes,
        organizers: dbOrganizers,
        recentEvents,
        marketplaceVolume: marketplaceVolume[0]?.volume || 0,
        marketplaceSales: marketplaceVolume[0]?.count || 0,
        eventTimeline,
      },
    }
  } catch (err) {
    console.error('DB fetch error:', err)
    return {
      db: {
        eventCount: 0,
        ticketCount: 0,
        listingCount: 0,
        activeListings: 0,
        organizerCount: 0,
        uniqueWallets: 0,
        recentAnalytics: [],
        ticketsByEvent: [],
        topBuyers: [],
        analyticsTypes: [],
        organizers: [],
        recentEvents: [],
        marketplaceVolume: 0,
        marketplaceSales: 0,
        eventTimeline: [],
      },
    }
  }
}
