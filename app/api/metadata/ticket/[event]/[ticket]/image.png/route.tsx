import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { EventModel, TicketModel } from '@/lib/db/models'

export const dynamic = 'force-dynamic'

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
    const tierName = (ticket as any)?.tierName || 'General'
    const ticketIndex = (ticket as any)?.ticketIndex ?? 1
    const imageUri = (event as any)?.imageUri || ''

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            background: '#0a0a0a',
          }}
        >
          {imageUri ? (
            <img
              src={imageUri}
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #ff6b00 0%, #e04500 100%)',
                display: 'flex',
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '55%',
              display: 'flex',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 12,
              padding: '6px 14px 6px 8px',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: '#ff6b00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: 'white',
              }}
            >
              T
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                letterSpacing: 2,
              }}
            >
              TICKETLY
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              display: 'flex',
              background: 'rgba(255, 107, 0, 0.85)',
              borderRadius: 20,
              padding: '8px 18px',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              {tierName}
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '0 28px 24px',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: eventName.length > 30 ? 26 : 34,
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.15,
                textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              }}
            >
              {eventName}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#ff8c33' }}>
                {tierName}
              </span>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>·</span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.8)',
                  letterSpacing: 1,
                }}
              >
                #{ticketIndex}
              </span>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: '#39FF14',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                On-chain · Solana
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 600,
        headers: { 'Cache-Control': 'public, max-age=86400' },
      }
    )
  } catch (error) {
    console.error('Ticket image generation error:', error)
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ff6b00 0%, #e04500 100%)',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              color: 'white',
            }}
          >
            T
          </div>
          <span
            style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: 3 }}
          >
            TICKETLY
          </span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            NFT Ticket
          </span>
        </div>
      ),
      { width: 600, height: 600 }
    )
  }
}