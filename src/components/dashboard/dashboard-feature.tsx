'use client'

import Link from 'next/link'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
import { useWallet } from '@solana/wallet-adapter-react'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'

export function DashboardFeature() {
  const { publicKey } = useWallet()
  const { data: events = [], isLoading } = useTicketlyEvents()

  const myEvents = publicKey ? events.filter((e) => e.authority === publicKey.toBase58()) : []
  const totalRevenue = myEvents.reduce((acc, e) => acc + Number(e.totalRevenue), 0)
  const totalSold = myEvents.reduce((acc, e) => acc + Number(e.totalMinted), 0)
  const totalCheckedIn = myEvents.reduce((acc, e) => acc + Number(e.totalCheckedIn), 0)

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl md:text-4xl text-white mb-2">Dashboard</h1>
          <p className="text-white/40 text-sm">Create events, monitor performance, and withdraw revenue.</p>
        </div>
        <Link href="/dashboard/events/create" className="btn-primary py-3 px-6 text-sm w-fit">Create Event</Link>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: `${lamportsToSol(totalRevenue).toFixed(4)} SOL`, icon: '💰', accent: true },
          { label: 'Tickets Sold', value: totalSold.toLocaleString(), icon: '🎫' },
          { label: 'Checked In', value: totalCheckedIn.toLocaleString(), icon: '✅' },
          { label: 'Active Events', value: myEvents.filter((e) => e.isActive && !e.isCancelled).length.toString(), icon: '📅' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-5 group hover:bg-white/03 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className={`font-display text-2xl ${s.accent ? 'text-brand-400' : 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Events Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08 flex items-center justify-between">
          <h2 className="font-display text-white">My Events</h2>
          {publicKey && <Link href="/dashboard/events" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>}
        </div>

        {isLoading && <div className="p-6 text-center text-white/40 text-sm">Loading events from devnet...</div>}

        {!isLoading && !publicKey && <div className="p-6 text-center text-white/40 text-sm">Connect a wallet to see your events.</div>}

        {!isLoading && publicKey && myEvents.length === 0 && (
          <div className="p-6 text-center text-white/40 text-sm">No events yet. Create your first event to get started.</div>
        )}

        {!isLoading && myEvents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/08">
                  <th className="text-left px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Event</th>
                  <th className="text-left px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Sold</th>
                  <th className="text-right px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => (
                  <tr key={event.publicKey} className="border-b border-white/05 hover:bg-white/03 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/events/${event.publicKey}`} className="text-white font-medium hover:text-brand-400 transition-colors">{event.name}</Link>
                    </td>
                    <td className="px-5 py-3 text-white/50">
                      {new Date(Number(event.eventStart) * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge text-[10px] ${event.isCancelled ? 'bg-red-500/20 text-red-400 border-red-500/30' : event.isActive ? 'badge-active' : 'bg-white/10 text-white/50 border-white/10'}`}>
                        {event.isCancelled ? 'Cancelled' : event.isActive ? 'On sale' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-white/50 font-mono">{Number(event.totalMinted)}</td>
                    <td className="px-5 py-3 text-right font-mono text-brand-400">{lamportsToSol(Number(event.totalRevenue)).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/revenue" className="glass rounded-xl p-5 hover:bg-white/03 transition-colors group">
          <h3 className="font-display text-white group-hover:text-brand-400 transition-colors mb-1">Revenue Withdrawal</h3>
          <p className="text-xs text-white/40">Withdraw program revenue from your event PDAs.</p>
        </Link>
        <Link href="/gate" className="glass rounded-xl p-5 hover:bg-white/03 transition-colors group">
          <h3 className="font-display text-white group-hover:text-brand-400 transition-colors mb-1">Gate Scanner</h3>
          <p className="text-xs text-white/40">Check in attendees at the event gate.</p>
        </Link>
      </div>
    </div>
  )
}
