'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

const PROGRAM_ID = 'GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs'

export function Footer() {
  const [logoError, setLogoError] = useState(false)

  return (
    <footer className="relative border-t border-white/06 bg-dark-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group">
              {!logoError ? (
                <Image
                  src="/logo.png"
                  alt="Ticketly"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-sm font-display text-white">
                  T
                </div>
              )}
              <span className="font-display text-xl text-white group-hover:text-brand-400 transition-colors">
                Ticketly
              </span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed font-body mb-4 max-w-xs">
              On-chain event ticketing powered by Solana. Mint, verify, and trade tickets as NFTs.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://x.com/ticketly_app" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/40 hover:text-brand-400 hover:border-brand-600/30 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://github.com/Ticketly-App" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/40 hover:text-brand-400 hover:border-brand-600/30 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="md:col-span-2">
            <h4 className="font-display text-sm text-white/60 mb-3 tracking-wider">Product</h4>
            <ul className="space-y-2">
              {[
                { href: '/events', label: 'Browse Events' },
                { href: '/marketplace', label: 'Marketplace' },
                { href: '/dashboard/events/create', label: 'Create Event' },
                { href: '/gate', label: 'Gate Scanner' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/30 hover:text-brand-400 transition-colors font-body">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="font-display text-sm text-white/60 mb-3 tracking-wider">Resources</h4>
            <ul className="space-y-2">
              {[
                { href: '/docs', label: 'Documentation' },
                { href: '/faq', label: 'FAQ' },
                { href: `https://solscan.io/account/${PROGRAM_ID}?cluster=devnet`, label: 'Solscan Explorer' },
                { href: 'https://github.com/Ticketly-App', label: 'GitHub' },
              ].map((link) => {
                const isExternal = link.href.startsWith('http')
                const Comp = isExternal ? 'a' : Link
                const props = isExternal ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' } : { href: link.href }
                return (
                  <li key={link.href}>
                    <Comp {...props as any} className="text-sm text-white/30 hover:text-brand-400 transition-colors font-body inline-flex items-center gap-1">
                      {link.label}
                      {isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-40" />}
                    </Comp>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Program */}
          <div className="md:col-span-4">
            <h4 className="font-display text-sm text-white/60 mb-3 tracking-wider">Program</h4>
            <div className="glass rounded-xl p-3">
              <p className="text-[10px] text-white/20 mb-1 font-body uppercase tracking-wider">Program ID (Devnet)</p>
              <a
                href={`https://solscan.io/account/${PROGRAM_ID}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-400 hover:text-brand-300 font-mono break-all leading-relaxed transition-colors inline-flex items-start gap-1"
              >
                {PROGRAM_ID}
                <ExternalLink className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/06 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20 font-body">
            &copy; {new Date().getFullYear()} Ticketly. Built on Solana.
          </p>
          <div className="flex items-center gap-3">
            <span className="badge badge-active text-[9px]">Devnet</span>
            <span className="text-xs text-white/15 font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
