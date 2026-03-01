import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { EventModel, TicketModel } from '@/lib/db/models'

export const dynamic = 'force-dynamic'

const TIER_NAMES: Record<string, string> = {
  'General': 'General Admission',
  'Early Bird': 'Early Bird',
  'VIP': 'VIP',
  'VVIP': 'VVIP',
  'Custom': 'Custom',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ event: string; ticket: string }> }
) {
  try {
    const { event: eventKey, ticket: ticketId } = await params
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticketly.tech'

    await connectDB()

    // Try to find event and ticket from MongoDB
    const [event, ticket] = await Promise.all([
      EventModel.findOne({ pubkey: eventKey }).lean(),
      TicketModel.findOne({ pubkey: ticketId }).lean().catch(() => null),
    ])

    const eventName = (event as any)?.name || 'Ticketly Event'
    const venue = (event as any)?.venue || 'On-chain'
    const category = (event as any)?.categories?.[0] || 'Event'
    const tierName = (ticket as any)?.tierName || 'General Admission'
    const ticketIndex = (ticket as any)?.ticketIndex ?? ticketId

    const imageUrl = `${appUrl}/api/metadata/ticket/${eventKey}/${ticketId}/image.svg`

    // Return Metaplex-standard metadata
    const metadata = {
      name: `${eventName} - ${tierName} #${ticketIndex}`,
      symbol: 'TKTLY',
      description: `NFT Ticket for ${eventName} at ${venue}. Tier: ${tierName}. Powered by Ticketly on Solana.`,
      image: imageUrl,
      external_url: `${appUrl}/events/${eventKey}`,
      attributes: [
        { trait_type: 'Event', value: eventName },
        { trait_type: 'Venue', value: venue },
        { trait_type: 'Category', value: category },
        { trait_type: 'Tier', value: tierName },
        { trait_type: 'Ticket Number', value: String(ticketIndex) },
        { trait_type: 'Platform', value: 'Ticketly' },
      ],
      properties: {
        files: [{ uri: imageUrl, type: 'image/svg+xml' }],
        category: 'ticket',
        creators: [],
      },
    }

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Metadata API error:', error)
    return NextResponse.json(
      { name: 'Ticketly Ticket', symbol: 'TKTLY', description: 'NFT Ticket powered by Ticketly', image: '' },
      { status: 200 }
    )
  }
}
