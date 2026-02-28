'use client'

import { use } from 'react'
import { useTicketlyEvent, mapTicketTier } from '@/hooks/use-ticketly-events'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'

const TIER_NAMES: Record<string, string> = { '0': 'General', '1': 'Early Bird', '2': 'VIP', '3': 'VVIP', '4': 'Custom' }
const TIER_COLORS = ['#d946ef', '#06b6d4', '#22c55e', '#f59e0b', '#8b5cf6']

export default function EventAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: event, isLoading } = useTicketlyEvent(id)

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 rounded bg-white/5 animate-pulse" /><div className="h-40 rounded-2xl bg-white/5 animate-pulse" /></div>
  if (!event) return <div className="glass rounded-2xl p-12 text-center"><p className="text-white/50">Event not found on devnet.</p></div>

  const tiers = event.ticketTiers.map(mapTicketTier)
  const totalCapacity = tiers.reduce((acc, t) => acc + t.supply, 0)
  const totalMinted = Number(event.totalMinted)
  const totalCheckedIn = Number(event.totalCheckedIn)
  const totalRevenue = lamportsToSol(Number(event.totalRevenue))
  const sellThrough = totalCapacity > 0 ? (totalMinted / totalCapacity) * 100 : 0
  const checkInRate = totalMinted > 0 ? (totalCheckedIn / totalMinted) * 100 : 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-display text-3xl text-white mb-2">Analytics — {event.name}</h1>
        <p className="text-white/40 text-sm">Live on-chain metrics from the Ticketly program on devnet.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Revenue', value: `${totalRevenue.toFixed(4)} SOL`, accent: true },
          { label: 'Tickets Sold', value: `${totalMinted} / ${totalCapacity}`, sub: `${sellThrough.toFixed(1)}% sold` },
          { label: 'Checked In', value: totalCheckedIn.toString(), sub: `${checkInRate.toFixed(1)}% rate` },
          { label: 'Status', value: event.isCancelled ? 'Cancelled' : event.isActive ? 'Active' : 'Draft' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-display font-bold text-xl ${s.accent ? 'text-brand-400' : 'text-white'}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-white/30 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tier Breakdown */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-white">Tier Breakdown</h3>
        <div className="space-y-3">
          {tiers.map((tier, i) => {
            const percent = tier.supply > 0 ? (tier.minted / tier.supply) * 100 : 0
            const revenue = lamportsToSol(Number(tier.price) * tier.minted)
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TIER_COLORS[i % TIER_COLORS.length] }} />
                    <span className="text-white font-medium">{TIER_NAMES[tier.tierType] || `Tier ${i}`}</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/50">
                    <span>{tier.minted}/{tier.supply} sold</span>
                    <span className="text-brand-400 font-medium">{revenue.toFixed(4)} SOL</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/05 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: TIER_COLORS[i % TIER_COLORS.length] }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Visual Charts Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-white">Sales Progress</h3>
          <div className="relative h-48 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-40 h-40">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#grad)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${sellThrough * 5.02} ${502 - sellThrough * 5.02}`} strokeDashoffset="125.5" />
              <defs><linearGradient id="grad"><stop offset="0%" stopColor="#d946ef" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-display font-bold text-3xl text-white">{sellThrough.toFixed(0)}%</span>
              <span className="text-xs text-white/40">Sold</span>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-white">Check-in Rate</h3>
          <div className="relative h-48 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-40 h-40">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#39ff14" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${checkInRate * 5.02} ${502 - checkInRate * 5.02}`} strokeDashoffset="125.5" opacity="0.8" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-display font-bold text-3xl text-white">{checkInRate.toFixed(0)}%</span>
              <span className="text-xs text-white/40">Checked In</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="glass rounded-2xl p-5 space-y-2 text-sm">
        <h3 className="font-display font-semibold text-white mb-3">Event Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-white/40">Venue:</span> <span className="text-white ml-1">{event.venue}</span></div>
          <div><span className="text-white/40">Start:</span> <span className="text-white ml-1">{new Date(Number(event.eventStart) * 1000).toLocaleString()}</span></div>
          <div><span className="text-white/40">Resale:</span> <span className="text-white ml-1">{event.resaleAllowed ? 'Enabled' : 'Disabled'}</span></div>
          <div><span className="text-white/40">Whitelist:</span> <span className="text-white ml-1">{event.whitelistGated ? 'Required' : 'Open'}</span></div>
          <div><span className="text-white/40">POAP:</span> <span className="text-white ml-1">{event.poapEnabled ? 'Enabled' : 'Disabled'}</span></div>
          <div><span className="text-white/40">Royalty:</span> <span className="text-white ml-1">{event.royaltyBps / 100}%</span></div>
        </div>
      </div>
    </div>
  )
}
