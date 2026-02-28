'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/solana/solana-provider'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const { connected } = useWallet()
  const { cluster } = useCluster()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/events', label: 'Events' },
    { href: '/marketplace', label: 'Marketplace' },
    ...(connected
      ? [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/tickets', label: 'My Tickets' },
        ]
      : []),
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="glass-strong rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between border border-white/08">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-sm font-display text-white">
              T
            </div>
            <span className="font-display text-lg text-white group-hover:text-brand-400 transition-colors hidden sm:inline">
              Ticketly
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname?.startsWith(link.href)
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-white/50 hover:text-white hover:bg-white/05'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: cluster badge + wallet + mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cluster badge */}
            <span className="badge badge-active text-[9px] hidden sm:inline-flex">{cluster.name.toUpperCase()}</span>

            {/* Wallet button (styled for dark theme) */}
            <div className="[&_button]:!bg-brand-600/20 [&_button]:!border [&_button]:!border-brand-600/30 [&_button]:!text-brand-400 [&_button]:!rounded-xl [&_button]:!text-xs [&_button]:!font-medium [&_button]:!h-9 [&_button]:!px-4 [&_button]:hover:!bg-brand-600/30 [&_button]:!transition-all [&_.wallet-adapter-button-start-icon]:!mr-2">
              <WalletButton />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/05 transition-all"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="lg:hidden glass-strong rounded-2xl mt-2 p-4 border border-white/08 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    pathname?.startsWith(link.href)
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                      : 'text-white/50 hover:text-white hover:bg-white/05'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/08 flex items-center justify-between">
              <span className="text-xs text-white/30 font-mono">{cluster.name}</span>
              <span className="badge badge-active text-[9px]">DEVNET</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
