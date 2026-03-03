'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Popup callback page — after X OAuth completes, NextAuth redirects the popup here.
 * This page notifies the opener (parent window) and auto-closes.
 */
export default function AuthPopupDone() {
  useEffect(() => {
    // Notify parent window that authentication completed
    if (window.opener) {
      try {
        window.opener.postMessage(
          { type: 'x-auth-complete', success: true },
          window.location.origin
        )
      } catch {
        // opener might be cross-origin or closed
      }
      // Give a moment for the message to be received, then close
      setTimeout(() => window.close(), 300)
    } else {
      // Opened directly (not as popup) — redirect to dashboard
      window.location.href = '/dashboard'
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-white/60 text-sm text-center">
          Authentication complete.<br />
          This window will close automatically.
        </p>
        <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
      </div>
    </div>
  )
}
