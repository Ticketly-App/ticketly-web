import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { EventModel, TicketModel } from '@/lib/db/models'

export const dynamic = 'force-dynamic'

const CATEGORY_COLORS: Record<string, [string, string]> = {
  Music: ['#9333ea', '#ec4899'],
  Sports: ['#059669', '#06b6d4'],
  Conference: ['#2563eb', '#7c3aed'],
  Tech: ['#2563eb', '#4f46e5'],
  Theatre: ['#b91c1c', '#f43f5e'],
  Art: ['#d97706', '#f43f5e'],
  Gaming: ['#7c3aed', '#06b6d4'],
  Food: ['#ea580c', '#fbbf24'],
}

function generateTicketSVG(
  eventName: string,
  tierName: string,
  ticketNumber: string,
  venue: string,
  category: string,
): string {
  const [color1, color2] = CATEGORY_COLORS[category] || ['#FF5000', '#E04500']
  const initial = eventName.charAt(0).toUpperCase()

  // Truncate long names
  const displayName = eventName.length > 28 ? eventName.slice(0, 25) + '...' : eventName
  const displayVenue = venue.length > 35 ? venue.slice(0, 32) + '...' : venue

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1}"/>
      <stop offset="100%" style="stop-color:${color2}"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.6)"/>
    </linearGradient>
    <pattern id="dots" patternUnits="userSpaceOnUse" width="30" height="30">
      <circle cx="15" cy="15" r="1.5" fill="rgba(255,255,255,0.08)"/>
    </pattern>
    <clipPath id="rounded">
      <rect x="0" y="0" width="600" height="400" rx="24" ry="24"/>
    </clipPath>
  </defs>

  <g clip-path="url(#rounded)">
    <!-- Background gradient -->
    <rect width="600" height="400" fill="url(#bg)"/>
    <rect width="600" height="400" fill="url(#dots)"/>
    <rect width="600" height="400" fill="url(#overlay)"/>

    <!-- Large initial watermark -->
    <text x="480" y="200" font-family="Arial,Helvetica,sans-serif" font-size="220" font-weight="bold" fill="rgba(255,255,255,0.06)" text-anchor="middle">${initial}</text>

    <!-- Ticket dashed line -->
    <line x1="0" y1="280" x2="600" y2="280" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="8,6"/>
    <circle cx="0" cy="280" r="14" fill="#030303"/>
    <circle cx="600" cy="280" r="14" fill="#030303"/>

    <!-- Event name -->
    <text x="40" y="100" font-family="Arial,Helvetica,sans-serif" font-size="32" font-weight="bold" fill="white" letter-spacing="1">${displayName}</text>

    <!-- Venue -->
    <text x="40" y="135" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="rgba(255,255,255,0.6)">${displayVenue}</text>

    <!-- Tier badge -->
    <rect x="40" y="160" width="${tierName.length * 11 + 28}" height="30" rx="15" fill="rgba(255,255,255,0.15)"/>
    <text x="54" y="180" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="600" fill="white" letter-spacing="0.5">${tierName}</text>

    <!-- Category badge -->
    <rect x="${54 + tierName.length * 11 + 28}" y="160" width="${category.length * 9 + 24}" height="30" rx="15" fill="rgba(0,0,0,0.3)"/>
    <text x="${66 + tierName.length * 11 + 28}" y="180" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">${category}</text>

    <!-- Ticket number -->
    <text x="40" y="250" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.4)">TICKET</text>
    <text x="40" y="270" font-family="monospace" font-size="20" font-weight="bold" fill="white" letter-spacing="2">#${ticketNumber}</text>

    <!-- Ticketly branding -->
    <rect x="40" y="305" width="32" height="32" rx="8" fill="rgba(255,80,0,0.9)"/>
    <text x="49" y="328" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="bold" fill="white">T</text>
    <text x="82" y="325" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="bold" fill="white" letter-spacing="2">TICKETLY</text>
    <text x="82" y="342" font-family="Arial,Helvetica,sans-serif" font-size="10" fill="rgba(255,255,255,0.4)">On-chain tickets on Solana</text>

    <!-- Verified badge -->
    <circle cx="540" cy="320" r="20" fill="rgba(57,255,20,0.15)" stroke="rgba(57,255,20,0.3)" stroke-width="1"/>
    <path d="M532 320 l5 5 l10-10" stroke="#39FF14" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ event: string; ticket: string }> }
) {
  try {
    const { event: eventKey, ticket: ticketId } = await params

    await connectDB()

    const [event, ticket] = await Promise.all([
      EventModel.findOne({ pubkey: eventKey }).lean(),
      TicketModel.findOne({ pubkey: ticketId }).lean().catch(() => null),
    ])

    const eventName = (event as any)?.name || 'Ticketly Event'
    const venue = (event as any)?.venue || 'On-chain Venue'
    const category = (event as any)?.categories?.[0] || 'Event'
    const tierName = (ticket as any)?.tierName || 'General Admission'
    const ticketNumber = String((ticket as any)?.ticketIndex ?? ticketId.slice(0, 8))

    const svg = generateTicketSVG(eventName, tierName, ticketNumber, venue, category)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('SVG generation error:', error)
    // Return a basic fallback SVG
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <rect width="600" height="400" rx="24" fill="#FF5000"/>
      <text x="300" y="200" font-family="Arial" font-size="40" font-weight="bold" fill="white" text-anchor="middle">Ticketly Ticket</text>
    </svg>`
    return new NextResponse(fallbackSvg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }
}
