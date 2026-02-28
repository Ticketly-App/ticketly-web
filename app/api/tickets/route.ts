import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { TicketModel, EventModel, AnalyticsEventModel } from '@/lib/db/models'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const owner = searchParams.get('owner')
    const eventPubkey = searchParams.get('event')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const query: Record<string, unknown> = {}
    if (owner) query.owner = owner
    if (eventPubkey) query.eventPubkey = eventPubkey

    const [tickets, total] = await Promise.all([
      TicketModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TicketModel.countDocuments(query),
    ])

    return NextResponse.json({ tickets, total, page, limit })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    // Upsert ticket by pubkey to avoid duplicates
    const ticket = await TicketModel.findOneAndUpdate(
      { pubkey: body.pubkey },
      {
        $set: {
          pubkey: body.pubkey,
          event: body.event,
          eventPubkey: body.eventPubkey,
          owner: body.owner,
          tierId: body.tierId,
          tierName: body.tierName,
          ticketIndex: body.ticketIndex,
          purchasePrice: body.purchasePrice,
          purchasedAt: body.purchasedAt || new Date(),
          txSignature: body.txSignature,
        },
        $setOnInsert: {
          isUsed: false,
          isListed: false,
          poapMinted: false,
        },
      },
      { upsert: true, new: true },
    )

    // Update event ticket sold count
    await EventModel.findOneAndUpdate(
      { pubkey: body.eventPubkey },
      {
        $inc: { totalTicketsSold: 1 },
        $set: { [`tiers.${body.tierId}.sold`]: (body.ticketIndex || 0) + 1 },
      },
    ).catch(() => {})

    // Log analytics event
    await AnalyticsEventModel.create({
      type: 'ticket_mint',
      eventPubkey: body.eventPubkey,
      ticketPubkey: body.pubkey,
      wallet: body.owner,
      amount: body.purchasePrice,
      timestamp: new Date(),
    }).catch(() => {})

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
