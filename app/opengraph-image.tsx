import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Ticketly | On-Chain Event Ticketing on Solana'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const bebasNeueFontPromise = fetch(
  new URL('./fonts/BebasNeue-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

const dmMonoFontPromise = fetch(
  new URL('./fonts/DMMono-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

const dmSansFontPromise = fetch(
  new URL('./fonts/DMSans-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

const logoPromise = fetch(
  new URL('../public/logo.png', import.meta.url)
)
  .then(async (res) => {
    if (!res.ok) throw new Error('not found')
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:image/png;base64,${buf.toString('base64')}`
  })
  .catch(() =>
    fetch(new URL('../public/logo.jpg', import.meta.url))
      .then(async (res) => {
        if (!res.ok) return ''
        const buf = Buffer.from(await res.arrayBuffer())
        return `data:image/jpeg;base64,${buf.toString('base64')}`
      })
      .catch(() => '')
  )

export default async function Image() {
  const [bebasNeueFont, dmMonoFont, dmSansFont, logoBase64] = await Promise.all(
    [bebasNeueFontPromise, dmMonoFontPromise, dmSansFontPromise, logoPromise]
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#060609',
          overflow: 'hidden',
        }}
      >
        {/* Warm background glow on left side */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '600px',
            height: '100%',
            backgroundImage:
              'radial-gradient(ellipse at 0% 50%, #1a0600 0%, #060609 70%)',
            display: 'flex',
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            backgroundImage:
              'linear-gradient(90deg, #FF3700 0%, rgba(255,80,0,0.3) 50%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            backgroundImage:
              'linear-gradient(90deg, #FF3700 0%, rgba(255,80,0,0.4) 50%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Center divider */}
        <div
          style={{
            position: 'absolute',
            left: '580px',
            top: '48px',
            width: '1px',
            height: '534px',
            backgroundImage:
              'linear-gradient(180deg, transparent, rgba(255,55,0,0.35) 20%, rgba(255,55,0,0.35) 80%, transparent)',
            display: 'flex',
          }}
        />

        {/* ══════ LEFT PANEL ══════ */}
        <div
          style={{
            width: '580px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 48px 0 64px',
            position: 'relative',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#FF3700',
                display: 'flex',
              }}
            />
            <span
              style={{
                fontFamily: '"DM Mono"',
                fontSize: '11px',
                letterSpacing: '0.3em',
                color: 'rgba(255,55,0,0.6)',
              }}
            >
              LIVE NOW
            </span>
          </div>

          {/* Brand row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              marginBottom: '28px',
            }}
          >
            {logoBase64 ? (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow:
                    '0 0 0 1px rgba(255,55,0,0.1), 0 20px 70px rgba(255,50,0,0.38)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoBase64}
                  width={54}
                  height={54}
                  alt="Ticketly logo"
                  style={{ borderRadius: '10px', objectFit: 'contain' }}
                />
              </div>
            ) : null}
            <span
              style={{
                fontFamily: '"Bebas Neue"',
                fontSize: '48px',
                letterSpacing: '0.14em',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              TICKETLY
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '22px',
            }}
          >
            <span
              style={{
                fontFamily: '"Bebas Neue"',
                fontSize: '88px',
                color: '#ffffff',
                lineHeight: 0.9,
                letterSpacing: '0.02em',
              }}
            >
              SELL
            </span>
            <span
              style={{
                fontFamily: '"Bebas Neue"',
                fontSize: '88px',
                color: '#FF3700',
                lineHeight: 0.9,
                letterSpacing: '0.02em',
              }}
            >
              TICKETS
            </span>
            <span
              style={{
                fontFamily: '"Bebas Neue"',
                fontSize: '88px',
                color: 'rgba(255,255,255,0.06)',
                lineHeight: 0.9,
                letterSpacing: '0.02em',
              }}
            >
              SMARTER.
            </span>
          </div>

          {/* Tagline */}
          <div style={{ display: 'flex', marginBottom: '28px' }}>
            <span
              style={{
                fontFamily: '"DM Sans"',
                fontSize: '14px',
                lineHeight: 1.7,
                letterSpacing: '0.025em',
                color: 'rgba(255,255,255,0.3)',
                maxWidth: '380px',
              }}
            >
              The all-in-one ticketing platform for organizers who are tired of
              paying fees they never agreed to.
            </span>
          </div>

          {/* URL mark */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div
              style={{
                width: '22px',
                height: '2px',
                backgroundColor: '#FF3700',
                display: 'flex',
              }}
            />
            <span
              style={{
                fontFamily: '"DM Mono"',
                fontSize: '13px',
                letterSpacing: '0.18em',
                color: 'rgba(255,55,0,0.65)',
              }}
            >
              TICKETLY.TECH
            </span>
          </div>
        </div>

        {/* ══════ RIGHT PANEL — TICKET ══════ */}
        <div
          style={{
            width: '620px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '370px',
              height: '510px',
              backgroundImage:
                'linear-gradient(155deg, rgba(20,8,2,0.95) 0%, rgba(12,4,1,0.98) 100%)',
              border: '1px solid rgba(255,80,0,0.22)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ticket top accent */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                backgroundImage:
                  'linear-gradient(90deg, #FF4800, #FF8C00, rgba(255,140,0,0.3))',
                display: 'flex',
              }}
            />

            {/* Top section */}
            <div
              style={{
                padding: '28px 24px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '54%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: '"DM Mono"',
                    fontSize: '9px',
                    letterSpacing: '0.24em',
                    color: 'rgba(255,80,0,0.6)',
                    marginBottom: '10px',
                  }}
                >
                  TICKETLY PLATFORM · ZERO FEES
                </span>
                <span
                  style={{
                    fontFamily: '"Bebas Neue"',
                    fontSize: '38px',
                    lineHeight: 0.95,
                    color: '#ffffff',
                    marginBottom: '12px',
                  }}
                >
                  YOUR NEXT EVENT STARTS HERE
                </span>
                <span
                  style={{
                    fontFamily: '"DM Mono"',
                    fontSize: '9px',
                    letterSpacing: '0.16em',
                    color: 'rgba(255,255,255,0.22)',
                  }}
                >
                  ORGANIZER PLATFORM · ALL EVENTS · WORLDWIDE
                </span>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: 'flex',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '14px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"DM Mono"',
                      fontSize: '8px',
                      letterSpacing: '0.16em',
                      color: 'rgba(255,255,255,0.25)',
                      marginBottom: '5px',
                    }}
                  >
                    PLATFORM FEE
                  </span>
                  <span
                    style={{
                      fontFamily: '"Bebas Neue"',
                      fontSize: '28px',
                      color: '#FF4800',
                      letterSpacing: '0.02em',
                    }}
                  >
                    $0
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    paddingLeft: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"DM Mono"',
                      fontSize: '8px',
                      letterSpacing: '0.16em',
                      color: 'rgba(255,255,255,0.25)',
                      marginBottom: '5px',
                    }}
                  >
                    TICKET TYPES
                  </span>
                  <span
                    style={{
                      fontFamily: '"Bebas Neue"',
                      fontSize: '28px',
                      color: 'rgba(255,255,255,0.8)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    ∞
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    paddingLeft: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"DM Mono"',
                      fontSize: '8px',
                      letterSpacing: '0.16em',
                      color: 'rgba(255,255,255,0.25)',
                      marginBottom: '5px',
                    }}
                  >
                    YOUR CONTROL
                  </span>
                  <span
                    style={{
                      fontFamily: '"Bebas Neue"',
                      fontSize: '28px',
                      color: 'rgba(255,255,255,0.8)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    100%
                  </span>
                </div>
              </div>
            </div>

            {/* Perforation line */}
            <div
              style={{
                width: '100%',
                height: '1px',
                borderTop: '1px dashed rgba(255,80,0,0.25)',
                display: 'flex',
                position: 'relative',
              }}
            >
              {/* Left notch */}
              <div
                style={{
                  position: 'absolute',
                  left: '-10px',
                  top: '-10px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#060609',
                  border: '1px solid rgba(255,80,0,0.22)',
                  display: 'flex',
                }}
              />
              {/* Right notch */}
              <div
                style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '-10px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#060609',
                  border: '1px solid rgba(255,80,0,0.22)',
                  display: 'flex',
                }}
              />
            </div>

            {/* Bottom section */}
            <div
              style={{
                padding: '18px 24px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '46%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontFamily: '"DM Mono"',
                      fontSize: '8px',
                      letterSpacing: '0.18em',
                      color: 'rgba(255,255,255,0.22)',
                      marginBottom: '3px',
                    }}
                  >
                    FOR ORGANIZERS
                  </span>
                  <span
                    style={{
                      fontFamily: '"Bebas Neue"',
                      fontSize: '14px',
                      letterSpacing: '0.06em',
                      color: 'rgba(255,255,255,0.65)',
                    }}
                  >
                    YOU — NOT THE PLATFORM
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontFamily: '"DM Mono"',
                      fontSize: '8px',
                      letterSpacing: '0.18em',
                      color: 'rgba(255,255,255,0.22)',
                      marginBottom: '3px',
                    }}
                  >
                    HIDDEN FEES
                  </span>
                  <span
                    style={{
                      fontFamily: '"Bebas Neue"',
                      fontSize: '14px',
                      letterSpacing: '0.06em',
                      color: '#FF5500',
                    }}
                  >
                    NONE. EVER.
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontFamily: '"DM Mono"',
                      fontSize: '8px',
                      letterSpacing: '0.18em',
                      color: 'rgba(255,255,255,0.22)',
                      marginBottom: '3px',
                    }}
                  >
                    ACCESS TYPE
                  </span>
                  <span
                    style={{
                      fontFamily: '"Bebas Neue"',
                      fontSize: '14px',
                      letterSpacing: '0.06em',
                      color: 'rgba(255,255,255,0.65)',
                    }}
                  >
                    LIVE NOW
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontFamily: '"DM Mono"',
                      fontSize: '8px',
                      letterSpacing: '0.18em',
                      color: 'rgba(255,255,255,0.22)',
                      marginBottom: '3px',
                    }}
                  >
                    STATUS
                  </span>
                  <span
                    style={{
                      fontFamily: '"Bebas Neue"',
                      fontSize: '14px',
                      letterSpacing: '0.06em',
                      color: 'rgba(255,255,255,0.65)',
                    }}
                  >
                    LIVE ●
                  </span>
                </div>
              </div>

              {/* Ticket footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '10px',
                }}
              >
                <span
                  style={{
                    fontFamily: '"DM Mono"',
                    fontSize: '8px',
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.15)',
                  }}
                >
                  TKT-2026-001 · TICKETLY.TECH
                </span>
                <span
                  style={{
                    fontFamily: '"DM Mono"',
                    fontSize: '8px',
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.15)',
                  }}
                >
                  ZERO FEES ALWAYS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Bebas Neue',
          data: bebasNeueFont,
          style: 'normal' as const,
          weight: 400 as const,
        },
        {
          name: 'DM Mono',
          data: dmMonoFont,
          style: 'normal' as const,
          weight: 400 as const,
        },
        {
          name: 'DM Sans',
          data: dmSansFont,
          style: 'normal' as const,
          weight: 400 as const,
        },
      ],
    }
  )
}
