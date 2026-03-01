'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useState, useEffect } from 'react'
import { Connection } from '@solana/web3.js'
import { findOrganizerAddress } from '@/lib/ticketly/pdas'
import { useRouter } from 'next/navigation'
import { UserCircle, ArrowRight, X } from 'lucide-react'

export function ProfileCompleteModal() {
  const { publicKey, connected } = useWallet()
  const { cluster } = useCluster()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!connected || !publicKey) {
      setShow(false)
      return
    }

    // Don't show if already dismissed this session
    const dismissed = sessionStorage.getItem('profile-modal-dismissed')
    if (dismissed) return

    // Check if profile exists on-chain
    const checkProfile = async () => {
      setChecking(true)
      try {
        const connection = new Connection(cluster.endpoint, 'confirmed')
        const [organizerPda] = findOrganizerAddress(publicKey)
        const info = await connection.getAccountInfo(organizerPda)
        if (!info) {
          // No profile - show the modal after a small delay
          setTimeout(() => setShow(true), 1200)
        }
      } catch (err) {
        // Silently fail - don't block the user
        console.error('Profile check failed:', err)
      } finally {
        setChecking(false)
      }
    }

    checkProfile()
  }, [connected, publicKey, cluster.endpoint])

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('profile-modal-dismissed', 'true')
  }

  const handleGoToProfile = () => {
    setShow(false)
    sessionStorage.setItem('profile-modal-dismissed', 'true')
    router.push('/dashboard/profile')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 neon-border relative overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/05 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-neon-cyan/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-brand-600/20 flex items-center justify-center shadow-lg shadow-cyan-500/10 neon-border-cyan">
              <UserCircle className="w-8 h-8 text-neon-cyan" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h2 className="font-display text-2xl text-white mb-2">
              Complete Your Profile
            </h2>
            <p className="text-white/40 text-sm leading-relaxed font-body">
              Set up your organizer profile to start creating events and managing tickets on Solana.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            {[
              'Create and manage events on-chain',
              'Track revenue and analytics',
              'Build your organizer reputation',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 glass rounded-xl px-4 py-2.5">
                <div className="w-5 h-5 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm text-white/60 font-body">{text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoToProfile}
              className="btn-primary w-full py-3.5 text-base font-semibold group"
            >
              Set Up Profile
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 text-sm text-white/30 hover:text-white/60 transition-colors font-body"
            >
              I'll do it later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
