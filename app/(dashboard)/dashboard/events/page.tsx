'use client'

import Link from 'next/link'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
import { useWallet } from '@solana/wallet-adapter-react'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { toast } from 'sonner'

export default function DashboardEventsPage() {
  const { publicKey } = useWallet()
  const { data: events = [], isLoading, error } = useTicketlyEvents()

  const myEvents = publicKey ? events.filter((e) => e.authority === publicKey.toBase58()) : []

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl text-white mb-2">My Events</h1>
          <p className="text-white/40 text-sm">All your on-chain events fetched live from Solana devnet.</p>
        </div>
        <Link href="/dashboard/events/create" className="btn-primary py-2.5 px-5 text-sm flex-shrink-0">
          Create Event
        </Link>
      </header>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="h-5 w-48 rounded bg-white/5 mb-3" />
              <div className="h-4 w-32 rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-red-400 text-sm">Failed to load events from devnet. Check your connection.</p>
        </div>
      )}

      {!isLoading && !error && !publicKey && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/40 text-sm">Connect a wallet to see your events.</p>
        </div>
      )}

      {!isLoading && !error && publicKey && myEvents.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center space-y-3">
          <p className="text-white/50 text-sm">No events yet.</p>
          <Link href="/dashboard/events/create" className="btn-primary py-2 px-5 text-sm inline-block">
            Create your first event
          </Link>
        </div>
      )}

      {!isLoading && !error && myEvents.length > 0 && (
        <div className="space-y-3">
          {myEvents.map((event) => {
            const totalMinted = Number(event.totalMinted)
            const totalCapacity = event.ticketTiers.reduce((acc, t) => acc + t.supply, 0)
            const revenue = lamportsToSol(Number(event.totalRevenue))
            const soldPercent = totalCapacity > 0 ? (totalMinted / totalCapacity) * 100 : 0

            return (
              <Link key={event.publicKey} href={`/dashboard/events/${event.publicKey}`}>
                <div className="glass rounded-xl p-5 hover:bg-white/03 transition-colors group cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
                          {event.name}
                        </h3>
                        <span className="font-mono text-[10px] text-white/30 flex-shrink-0 flex items-center gap-1">
                          {event.publicKey.slice(0, 4)}...{event.publicKey.slice(-4)}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(event.publicKey); toast.success('Copied!') }}
                            className="text-white/20 hover:text-white/60 transition-colors"
                            title="Copy event address"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                          </button>
                        </span>
                        <span className={`badge text-[10px] flex-shrink-0 ${
                          event.isCancelled
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : Number(event.eventEnd) * 1000 < Date.now()
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : event.isActive ? 'badge-active' : 'bg-white/10 text-white/50 border-white/10'
                        }`}>
                          {event.isCancelled ? 'Cancelled' : Number(event.eventEnd) * 1000 < Date.now() ? 'Completed' : event.isActive ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>{event.venue}</span>
                        <span>{new Date(Number(event.eventStart) * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>{event.ticketTiers.length} tier{event.ticketTiers.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-mono text-sm text-white/50">{totalMinted}/{totalCapacity}</p>
                        <p className="text-[10px] text-white/30">tickets sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-brand-400 font-semibold">{revenue.toFixed(4)}</p>
                        <p className="text-[10px] text-white/30">SOL revenue</p>
                      </div>
                      <div className="w-16">
                        <div className="h-1.5 rounded-full bg-white/05 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(soldPercent, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-white/30 text-center mt-1">{soldPercent.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
