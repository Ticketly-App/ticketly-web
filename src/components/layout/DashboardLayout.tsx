'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/solana/solana-provider'
import { ReactNode } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
  { href: '/dashboard/events', label: 'My Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/dashboard/events/create', label: 'Create Event', icon: 'M12 4v16m8-8H4' },
  { href: '/dashboard/revenue', label: 'Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/dashboard/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { connected } = useWallet()

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/08 bg-dark-950/80 backdrop-blur-xl sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-white/08">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-sm font-display">T</div>
            <span className="font-display text-lg text-white group-hover:text-brand-400 transition-colors">Ticketly</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20' : 'text-white/50 hover:text-white hover:bg-white/05 border border-transparent'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/08 space-y-3">
          <Link href="/events" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/05 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Browse Events
          </Link>
          <Link href="/tickets" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/05 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            My Tickets
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-white/08 bg-dark-950/80 backdrop-blur-xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile menu */}
            <div className="lg:hidden flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-xs font-display">T</div>
              </Link>
            </div>

            {/* Mobile nav */}
            <div className="lg:hidden flex items-center gap-1 overflow-x-auto">
              {NAV_ITEMS.slice(0, 4).map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive ? 'bg-brand-600/20 text-brand-400' : 'text-white/40 hover:text-white'}`}>
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="badge badge-active text-[9px]">DEVNET</span>
              <div className="[&_button]:!bg-brand-600/20 [&_button]:!border-brand-600/30 [&_button]:!text-brand-400 [&_button]:!rounded-xl [&_button]:!text-xs [&_button]:!h-8 [&_button]:!px-3">
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
