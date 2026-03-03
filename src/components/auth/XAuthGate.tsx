'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'

interface XAuthGateProps {
  children: React.ReactNode
  /** Optional message override */
  message?: string
}

type BindingState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'bound' }
  | { status: 'conflict'; message: string; errorType?: string }
  | { status: 'rebinding' }

/**
 * Wraps content that requires X (Twitter) authentication.
 * Enforces 1:1 wallet ↔ X account mapping.
 * Shows appropriate modals for unauthenticated, unconnected, or conflicting states.
 */
export function XAuthGate({ children, message }: XAuthGateProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      }
    >
      <XAuthGateInner message={message}>{children}</XAuthGateInner>
    </Suspense>
  )
}

function XAuthGateInner({ children, message }: XAuthGateProps) {
  const { data: session, status } = useSession()
  const { publicKey, disconnect } = useWallet()
  const searchParams = useSearchParams()
  const [binding, setBinding] = useState<BindingState>({ status: 'idle' })
  const [authLoading, setAuthLoading] = useState(false)

  // Detect auth error returned via URL params (e.g. ?error=Callback)
  const authError = searchParams.get('error')

  const wallet = publicKey?.toBase58() || ''
  const twitterId = (session?.user as any)?.twitterId || ''
  const twitterHandle = (session?.user as any)?.twitterHandle || ''

  // Attempt wallet↔X binding when both are present
  const checkBinding = useCallback(async (forceRebind = false) => {
    if (!wallet || !twitterId) return
    setBinding(forceRebind ? { status: 'rebinding' } : { status: 'checking' })
    try {
      const res = await fetch('/api/auth/bind-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, twitterId, twitterHandle, force: forceRebind }),
      })
      const data = await res.json()
      if (res.ok) {
        setBinding({ status: 'bound' })
      } else if (res.status === 409) {
        setBinding({
          status: 'conflict',
          message: data.message || 'This wallet or X account is already linked to another account.',
          errorType: data.error,
        })
      } else {
        // 500/503/other server errors — allow through, don't block user
        console.warn('Bind wallet service unavailable, allowing through:', data.error)
        setBinding({ status: 'bound' })
      }
    } catch {
      // Network error — allow through (don't block on DB outage)
      setBinding({ status: 'bound' })
    }
  }, [wallet, twitterId, twitterHandle])

  useEffect(() => {
    if (wallet && twitterId) {
      checkBinding()
    } else {
      setBinding({ status: 'idle' })
    }
  }, [wallet, twitterId, checkBinding])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Handle X auth — simple redirect flow
  // OAuth 1.0A uses X's /authenticate endpoint which recognizes existing sessions
  // and doesn't force re-login (unlike OAuth 2.0's /authorize endpoint)
  const handleXAuth = () => {
    setAuthLoading(true)
    signIn('twitter')
  }

  // Not authenticated with X
  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/90 backdrop-blur-xl">
        <div className="relative rounded-3xl p-8 max-w-sm w-full mx-4 overflow-hidden border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/50">
          <div className="relative space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${authError ? 'bg-red-500/10' : 'bg-brand-600'}`}>
                {authError ? (
                  <AlertTriangle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.5} />
                )}
              </div>
            </div>

            {/* Text */}
            <div className="text-center">
              <h2 className="font-display text-2xl text-white mb-2">
                {authError ? 'X Login Failed' : 'Verify with  𝕏'}
              </h2>
              <p className="text-white/40 text-sm leading-relaxed font-body">
                {authError
                  ? "X blocked this login attempt. Click below to try again — you'll be redirected to X to authorize."
                  : message || "Connect your X (Twitter) account to continue. You'll be redirected to X to authorize securely."}
              </p>
            </div>

            {/* Error hint */}
            {authError && (
              <div className="rounded-xl px-4 py-3 bg-amber-500/[0.06] border border-amber-500/[0.12]">
                <p className="text-xs text-amber-400/80 leading-relaxed">
                  <span className="font-semibold text-amber-400">Tip:</span> Make sure you&apos;re logged into{' '}
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="underline text-amber-400">
                    x.com
                  </a>{' '}
                  first, then click Authorize below.
                </p>
              </div>
            )}

            {/* Benefits */}
            {!authError && (
              <div className="space-y-2">
                {[
                  'Your X profile linked to tickets',
                  'Verified identity on-chain',
                  '1:1 wallet & X account binding',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF5000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/50 font-body">{text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sign in button — redirects to X */}
            <button
              onClick={handleXAuth}
              disabled={authLoading}
              className="btn-primary w-full py-3.5 text-base font-semibold group flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Authorize with 𝕏
                </>
              )}
            </button>

            <p className="text-[11px] text-white/20 text-center font-body">
              {authError ? `Error: ${authError}` : "You'll be redirected to X. We never post on your behalf."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Binding check in progress
  if (binding.status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Verifying wallet binding...</p>
        </div>
      </div>
    )
  }

  // Rebinding in progress
  if (binding.status === 'rebinding') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/90 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Re-linking account...</p>
        </div>
      </div>
    )
  }

  // Binding conflict — block access with options
  if (binding.status === 'conflict') {
    const isTwitterConflict = binding.errorType === 'twitter_already_bound'
    const isWalletConflict = binding.errorType === 'wallet_already_bound'

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/90 backdrop-blur-xl">
        <div className="relative rounded-3xl p-8 max-w-sm w-full mx-4 overflow-hidden border border-red-500/20 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/50">
          <div className="relative space-y-5">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
              </div>
            </div>

            <div className="text-center">
              <h2 className="font-display text-xl text-white mb-2">Account Conflict</h2>
              <p className="text-white/40 text-sm leading-relaxed font-body">
                {binding.message}
              </p>
            </div>

            <div className="rounded-xl px-4 py-3 bg-red-500/[0.06] border border-red-500/[0.12]">
              <p className="text-xs text-red-400/80 leading-relaxed">
                Each wallet can only be linked to one X account, and each X account to one wallet. This prevents account sharing and ensures fair ticket distribution.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {/* Force re-bind — removes old binding and creates new one */}
              <button
                onClick={() => checkBinding(true)}
                className="w-full py-3 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-all text-sm font-semibold"
              >
                {isTwitterConflict
                  ? 'Link X account to this wallet instead'
                  : isWalletConflict
                    ? 'Link this wallet to current X instead'
                    : 'Re-link to this wallet'}
              </button>

              <button
                onClick={() => { disconnect(); setBinding({ status: 'idle' }) }}
                className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all text-sm font-medium"
              >
                Switch Wallet
              </button>
              <button
                onClick={() => { signOut(); setBinding({ status: 'idle' }) }}
                className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-all text-sm font-medium"
              >
                Sign in with different X account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Hook to get the current X user profile from next-auth session.
 * Returns null if not authenticated.
 */
export function useXProfile() {
  const { data: session, status } = useSession()

  if (status === 'loading' || !session?.user) {
    return {
      isAuthenticated: false,
      isLoading: status === 'loading',
      name: null as string | null,
      handle: null as string | null,
      image: null as string | null,
      twitterId: null as string | null,
    }
  }

  const user = session.user as any

  return {
    isAuthenticated: true,
    isLoading: false,
    name: user.name || null,
    handle: user.twitterHandle || null,
    image: user.twitterImage || user.image || null,
    twitterId: user.twitterId || null,
  }
}
