import { ImageResponse } from 'next/og'

export const alt = 'Ticketly — On-Chain Event Ticketing on Solana'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #030303 0%, #0a0a0a 40%, #111111 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 107, 0, 0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 200, 255, 0.08) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            position: 'relative',
          }}
        >
          {/* Logo box */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #ff6b00, #ff8c33)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              boxShadow: '0 0 60px rgba(255,107,0,0.3)',
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 800, color: 'white' }}>T</span>
          </div>

          {/* Title */}
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -1,
              lineHeight: 1,
            }}
          >
            Ticketly
          </span>

          {/* Tagline */}
          <span
            style={{
              fontSize: 24,
              color: 'rgba(255,255,255,0.6)',
              marginTop: 4,
            }}
          >
            On-Chain Event Ticketing on Solana
          </span>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {['NFT Tickets', 'Zero Fraud', 'Instant Check-in', 'Programmable Royalties'].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: '#39FF14',
              display: 'flex',
            }}
          />
          <span
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 2,
              textTransform: 'uppercase' as const,
            }}
          >
            ticketly.tech
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
