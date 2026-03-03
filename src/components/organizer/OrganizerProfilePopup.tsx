'use client'

import { useState } from 'react'
import { X, Globe, Copy } from 'lucide-react'
import type { OrganizerInfo } from '@/hooks/use-organizer-profiles'
import { GradientAvatar } from '@/components/ui/gradient-avatar'
import type { TicketlyEvent } from '@/hooks/use-ticketly-events'

interface OrganizerProfilePopupProps {
  organizer: OrganizerInfo | null
  authority: string
  allEvents: TicketlyEvent[]
  onClose: () => void
}

export function OrganizerProfilePopup({ organizer, authority, allEvents, onClose }: OrganizerProfilePopupProps) {
  const [copied, setCopied] = useState(false)

  const name = organizer?.name || 'Unknown Organizer'
  const handle = organizer?.username || null
  const xUrl = handle ? `https://x.com/${handle}` : null
  const logoUri = organizer?.logoUri || ''
  const website = organizer?.website || ''

  // Compute REAL stats from on-chain events data
  const orgEvents = allEvents.filter((e) => e.authority === authority)
  const totalEventsHosted = orgEvents.length
  const totalTicketsSold = orgEvents.reduce((sum, e) => sum + Number(e.totalMinted), 0)
  const totalRevenueSol = orgEvents.reduce((sum, e) => sum + Number(e.totalRevenue), 0) / 1_000_000_000
  const totalCheckedIn = orgEvents.reduce((sum, e) => sum + Number(e.totalCheckedIn), 0)
  const now = Date.now() / 1000
  const upcomingEvents = orgEvents.filter((e) => Number(e.eventEnd) >= now && !e.isCancelled).length

  const isWebsiteUrl = website && (website.includes('://') || website.includes('.')) && !website.match(/x\.com|twitter\.com/i)
  const websiteDisplay = isWebsiteUrl ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null

  const shortWallet = authority.slice(0, 4) + '...' + authority.slice(-4)

  const copyAddress = () => {
    navigator.clipboard.writeText(authority)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = [
    { value: totalEventsHosted, label: 'Events' },
    { value: totalTicketsSold, label: 'Tickets' },
    { value: totalCheckedIn, label: 'Check-ins' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="organizer-popup relative w-full max-w-[340px] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: '0.25s' }}
      >
        {/* Card body */}
        <div className="relative rounded-2xl overflow-hidden bg-[#141418] border border-white/[0.06]">

          {/* Top accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

          {/* Content */}
          <div className="px-5 pt-6 pb-5">

            {/* Close button */}
            <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg text-white/20 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Avatar + Identity */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="relative">
                {logoUri ? (
                  <OrganizerAvatar logoUri={logoUri} authority={authority} name={name} />
                ) : (
                  <GradientAvatar seed={authority} name={name} size={64} rounded="rounded-full" className="ring-2 ring-white/[0.06]" />
                )}
                {/* verified badge */}
                {handle && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-display text-lg text-white leading-tight">{name}</h3>
                {handle && (
                  <span className="text-xs text-white/30 mt-0.5 inline-block">@{handle}</span>
                )}
              </div>

              {/* Wallet chip */}
              <button
                onClick={copyAddress}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/25 hover:text-white/50 hover:bg-white/[0.07] transition-all text-[11px] font-mono"
              >
                {copied ? (
                  <span className="text-emerald-400">Copied!</span>
                ) : (
                  <>
                    {shortWallet}
                    <Copy className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6 py-3.5 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-base font-bold text-white tabular-nums">{s.value}</span>
                  <span className="text-[10px] text-white/25 font-medium">{s.label}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base font-bold text-brand-400 tabular-nums inline-flex items-center gap-1">
                  {totalRevenueSol > 0 ? totalRevenueSol.toFixed(1) : '0'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 15 14" fill="none"><path d="M14.9228 10.8113L12.4465 13.4271C12.3927 13.4839 12.3276 13.5293 12.2552 13.5602C12.1828 13.5912 12.1048 13.6071 12.0259 13.6071H0.28747C0.231459 13.6071 0.176669 13.591 0.129832 13.5607C0.0829943 13.5305 0.0461495 13.4874 0.0238241 13.4368C0.00149886 13.3862 -0.00533437 13.3303 0.00416409 13.2759C0.0136625 13.2215 0.0390788 13.1711 0.0772903 13.1308L2.55536 10.515C2.60905 10.4583 2.67396 10.4131 2.7461 10.3821C2.81825 10.3512 2.89607 10.3351 2.97476 10.335H14.7125C14.7685 10.335 14.8233 10.3511 14.8702 10.3814C14.917 10.4116 14.9538 10.4547 14.9762 10.5053C14.9985 10.5559 15.0053 10.6118 14.9958 10.6662C14.9863 10.7205 14.9609 10.771 14.9228 10.8113ZM12.4465 5.54387C12.3927 5.48704 12.3276 5.44174 12.2552 5.41078C12.1828 5.37983 12.1048 5.36387 12.0259 5.36391H0.28747C0.231459 5.36391 0.176669 5.38002 0.129832 5.41028C0.0829943 5.44054 0.0461495 5.48361 0.0238241 5.5342C0.00149886 5.5848 -0.00533437 5.64072 0.00416409 5.69509C0.0136625 5.74945 0.0390788 5.79991 0.0772903 5.84026L2.55536 8.45605C2.60905 8.51272 2.67396 8.55792 2.7461 8.58889C2.81825 8.61983 2.89607 8.63589 2.97476 8.63601H14.7125C14.7685 8.63601 14.8233 8.61989 14.8702 8.58964C14.917 8.55938 14.9538 8.51631 14.9762 8.46572C14.9985 8.41512 15.0053 8.3592 14.9958 8.30482C14.9863 8.25047 14.9609 8.20001 14.9228 8.15966L12.4465 5.54387ZM0.28747 3.66493H12.0259C12.1048 3.66496 12.1828 3.64901 12.2552 3.61805C12.3276 3.58709 12.3927 3.54178 12.4465 3.48496L14.9228 0.869165C14.9609 0.828829 14.9863 0.778376 14.9958 0.724005C15.0053 0.669634 14.9985 0.613715 14.9762 0.563118C14.9538 0.512521 14.917 0.469449 14.8702 0.439196C14.8233 0.408942 14.7685 0.392824 14.7125 0.392822H2.97476C2.89607 0.392954 2.81825 0.408995 2.7461 0.43995C2.67396 0.470906 2.60905 0.516119 2.55536 0.572789L0.0779291 3.18859C0.0397546 3.22888 0.0143495 3.27929 0.00482948 3.33358C-0.00469053 3.3879 0.00208847 3.44377 0.024335 3.49435C0.0465816 3.54492 0.0833288 3.58799 0.13007 3.61829C0.176811 3.64859 0.231514 3.6648 0.28747 3.66493Z" fill="CurrentColor"></path></svg>
                </span>
                <span className="text-[10px] text-white/25 font-medium">Revenue</span>
              </div>
            </div>

            {/* Completed events */}
            {totalEventsHosted - upcomingEvents > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span className="text-[11px] text-white/40 font-medium">
                  {totalEventsHosted - upcomingEvents} event hosted
                </span>
              </div>
            )}

            {/* Upcoming events */}
            {upcomingEvents > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/[0.08]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="text-[11px] text-emerald-400/80 font-medium">
                  {upcomingEvents} upcoming event{upcomingEvents > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {xUrl && (
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-medium"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>@{handle}</span>
                </a>
              )}
              {websiteDisplay && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{websiteDisplay.length > 18 ? websiteDisplay.slice(0, 18) + '…' : websiteDisplay}</span>
                </a>
              )}
              {!xUrl && !websiteDisplay && (
                <div className="w-full text-center text-[11px] text-white/15 py-1">No social links</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// OrganizerAvatar: shows image, falls back to GradientAvatar on error
function OrganizerAvatar({ logoUri, authority, name }: { logoUri: string, authority: string, name: string }) {
  const [error, setError] = useState(false)
  if (error || !logoUri) {
    return <GradientAvatar seed={authority} name={name} size={64} rounded="rounded-full" className="ring-2 ring-white/[0.06]" />
  }
  return (
    <img
      src={logoUri}
      alt={name}
      className="w-16 h-16 rounded-full object-cover ring-2 ring-white/[0.06]"
      onError={() => setError(true)}
    />
  )
}
