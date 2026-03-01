'use client'

import { useCountUp } from '@/hooks/use-count-up'
import { usePlatformStats } from '@/hooks/use-platform-stats'
import { Calendar, Ticket, TrendingUp, UserCheck } from 'lucide-react'

export function LiveStats() {
  const { data: stats } = usePlatformStats()

  const events = useCountUp({ end: stats?.totalEvents || 0, duration: 2200 })
  const tickets = useCountUp({ end: stats?.totalTicketsSold || 0, duration: 2400 })
  const revenue = useCountUp({ end: stats?.totalRevenueSol || 0, duration: 2600, decimals: 2 })
  const checkins = useCountUp({ end: stats?.totalCheckins || 0, duration: 2000 })

  const items = [
    {
      ref: events.ref,
      value: events.displayValue,
      suffix: '+',
      label: 'Events Created',
      icon: Calendar,
      color: 'text-brand-400',
      glow: 'shadow-brand-500/20',
    },
    {
      ref: tickets.ref,
      value: tickets.displayValue,
      suffix: '+',
      label: 'Tickets Sold',
      icon: Ticket,
      color: 'text-neon-cyan',
      glow: 'shadow-cyan-500/20',
    },
    {
      ref: revenue.ref,
      value: revenue.displayValue,
      suffix: ' SOL',
      label: 'Revenue Generated',
      icon: TrendingUp,
      color: 'text-neon-green',
      glow: 'shadow-green-500/20',
    },
    {
      ref: checkins.ref,
      value: checkins.displayValue,
      suffix: '+',
      label: 'Check-ins',
      icon: UserCheck,
      color: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
  ]

  return (
    <div className="mt-20 glass rounded-2xl p-8 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} ref={stat.ref} className="text-center group">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl glass-strong flex items-center justify-center shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
              </div>
              <div className={`text-3xl md:text-4xl font-display ${stat.color} mb-1 tabular-nums`}>
                {stat.value}
                <span className="text-lg opacity-70">{stat.suffix}</span>
              </div>
              <div className="text-xs text-white/40 uppercase tracking-widest font-mono">{stat.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
