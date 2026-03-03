'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { AlertTriangle, ExternalLink, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'
import { signIn } from 'next-auth/react'

const ERROR_MESSAGES: Record<string, { title: string; description: string; hint: string }> = {
  Callback: {
    title: 'X Login Blocked',
    description:
      'X (Twitter) flagged this login attempt as suspicious and denied access. This is a security measure from X — not an issue with Ticketly.',
    hint: 'Wait a few minutes, then try again. If you just changed your X password or logged in from a new device, X may need time to trust this session.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You denied the authorization request on X. Ticketly needs read-only access to verify your identity.',
    hint: 'Click "Try Again" and approve the permissions when prompted.',
  },
  OAuthSignin: {
    title: 'OAuth Error',
    description: 'There was a problem starting the X authentication flow.',
    hint: 'This is usually a temporary issue. Try clearing your browser cookies for x.com and try again.',
  },
  OAuthCallback: {
    title: 'Callback Error',
    description: 'X returned an unexpected response during authentication.',
    hint: 'Clear your cookies, close other X tabs, and try again.',
  },
  default: {
    title: 'Authentication Error',
    description: 'Something went wrong during X authentication.',
    hint: 'Try again in a few minutes. If the issue persists, try using a different browser or clearing cookies.',
  },
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error') || 'default'
  const info = ERROR_MESSAGES[error] || ERROR_MESSAGES.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="relative rounded-3xl p-8 max-w-md w-full overflow-hidden border border-red-500/20 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/50">
        <div className="relative space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h2 className="font-display text-2xl text-white mb-2">{info.title}</h2>
            <p className="text-white/40 text-sm leading-relaxed font-body">{info.description}</p>
          </div>

          {/* Hint */}
          <div className="rounded-xl px-4 py-3 bg-amber-500/[0.06] border border-amber-500/[0.12]">
            <p className="text-xs text-amber-400/80 leading-relaxed">
              <span className="font-semibold text-amber-400">Tip:</span> {info.hint}
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <p className="text-xs text-white/30 font-semibold uppercase tracking-wider">Before retrying, make sure:</p>
            {[
              'You are logged into X (twitter.com) in this browser',
              'No other X OAuth pop-ups are open',
              'You haven\'t denied the request multiple times recently',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-white/[0.03] border border-white/[0.06]">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm text-white/50 font-body">{text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => signIn('twitter')}
              className="btn-primary w-full py-3.5 text-base font-semibold group flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </button>
          </div>

          <p className="text-[11px] text-white/20 text-center font-body">
            Error code: {error}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-dark-950">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
