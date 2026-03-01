'use client'

import Link from 'next/link'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
import { useWallet } from '@solana/wallet-adapter-react'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { DollarSign, Ticket, UserCheck, CalendarDays, PlusCircle, ArrowUpRight, ScanLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function DashboardFeature() {
  const { publicKey } = useWallet()
  const { data: events = [], isLoading } = useTicketlyEvents()

  const myEvents = publicKey ? events.filter((e) => e.authority === publicKey.toBase58()) : []
  const totalRevenue = myEvents.reduce((acc, e) => acc + Number(e.totalRevenue), 0)
  const totalSold = myEvents.reduce((acc, e) => acc + Number(e.totalMinted), 0)
  const totalCheckedIn = myEvents.reduce((acc, e) => acc + Number(e.totalCheckedIn), 0)

  const kpiCards: { label: string; value: string; icon: LucideIcon; accent: boolean; iconBg: string; iconColor: string }[] = [
    { label: 'Total Revenue', value: `${lamportsToSol(totalRevenue).toFixed(4)} SOL`, icon: DollarSign, accent: true, iconBg: 'bg-brand-600/15', iconColor: 'text-brand-400' },
    { label: 'Tickets Sold', value: totalSold.toLocaleString(), icon: Ticket, accent: false, iconBg: 'bg-cyan-500/15', iconColor: 'text-neon-cyan' },
    { label: 'Checked In', value: totalCheckedIn.toLocaleString(), icon: UserCheck, accent: false, iconBg: 'bg-green-500/15', iconColor: 'text-neon-green' },
    { label: 'Active Events', value: myEvents.filter((e) => e.isActive && !e.isCancelled).length.toString(), icon: CalendarDays, accent: false, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
  ]

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl md:text-4xl text-white mb-2">Dashboard</h1>
          <p className="text-white/40 text-sm">Create events, monitor performance, and withdraw revenue.</p>
        </div>
        <Link href="/dashboard/events/create" className="btn-primary py-3 px-6 text-sm w-fit">
          <PlusCircle className="w-4 h-4" />
          Create Event
        </Link>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass rounded-xl p-5 group hover:bg-white/03 transition-all hover:shadow-lg hover:shadow-brand-600/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
                <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.iconColor}`} strokeWidth={1.5} />
                </div>
              </div>
              <p className={`font-display text-2xl ${s.accent ? 'text-brand-400' : 'text-white'}`}>{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Events Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08 flex items-center justify-between">
          <h2 className="font-display text-white">My Events</h2>
          {publicKey && (
            <Link href="/dashboard/events" className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {isLoading && <div className="p-6 text-center text-white/40 text-sm">Loading events from devnet...</div>}

        {!isLoading && !publicKey && <div className="p-6 text-center text-white/40 text-sm">Connect a wallet to see your events.</div>}

        {!isLoading && publicKey && myEvents.length === 0 && (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/05 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No events yet. Create your first event to get started.</p>
          </div>
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
        <Link href="/dashboard/revenue" className="glass rounded-xl p-5 hover:bg-white/03 transition-all group hover:shadow-lg hover:shadow-brand-600/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600/15 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-brand-400" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-white group-hover:text-brand-400 transition-colors">Revenue Withdrawal</h3>
          </div>
          <p className="text-xs text-white/40 ml-12">Withdraw program revenue from your event PDAs.</p>
        </Link>
        <Link href="/gate" className="glass rounded-xl p-5 hover:bg-white/03 transition-all group hover:shadow-lg hover:shadow-brand-600/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-neon-cyan" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-white group-hover:text-brand-400 transition-colors">Gate Scanner</h3>
          </div>
          <p className="text-xs text-white/40 ml-12">Check in attendees at the event gate.</p>
        </Link>
      </div>
    </div>
  )
}
