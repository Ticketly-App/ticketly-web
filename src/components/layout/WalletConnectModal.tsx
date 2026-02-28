'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useState, useEffect } from 'react'

export function WalletConnectModal() {
  const { connected, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const [dismissed, setDismissed] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay so the page renders first, then the modal fades in
    if (!connected && !connecting && !dismissed) {
      const timer = setTimeout(() => setShow(true), 600)
      return () => clearTimeout(timer)
    }
    if (connected) {
      setShow(false)
    }
  }, [connected, connecting, dismissed])

  if (!show || connected || dismissed) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 neon-border relative overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-brand-600/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h2 className="font-display text-2xl text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-white/40 text-sm leading-relaxed font-body">
              Connect a Solana wallet to explore events, buy tickets, and access your dashboard.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-2">
            {[
              { text: 'Mint NFT tickets directly', iconPath: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z' },
              { text: 'On-chain verified ownership', iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
              { text: 'Instant check-in at events', iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 glass rounded-xl px-4 py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400 flex-shrink-0">
                  <path d={item.iconPath} />
                </svg>
                <span className="text-sm text-white/60 font-body">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setVisible(true)
                setDismissed(true)
              }}
              className="btn-primary w-full py-3.5 text-base font-semibold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              Connect Wallet
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="w-full py-2.5 text-sm text-white/30 hover:text-white/60 transition-colors font-body"
            >
              Continue without wallet
            </button>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-white/20 text-center font-body">
            Running on Solana Devnet. No real funds required.
          </p>
        </div>
      </div>
    </div>
  )
}
