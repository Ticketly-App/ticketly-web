'use client'

import { useQuery } from '@tanstack/react-query'

export interface SellerProfile {
  wallet: string
  handle: string
}

/**
 * Batch-fetch Twitter handles for a list of seller wallet addresses.
 * Returns Map<wallet, SellerProfile> for O(1) lookups.
 */
export function useSellerProfiles(wallets: string[]) {
  const uniqueWallets = [...new Set(wallets.filter(Boolean))]

  return useQuery({
    queryKey: ['seller-profiles', uniqueWallets.sort().join(',')],
    queryFn: async (): Promise<Map<string, SellerProfile>> => {
      if (uniqueWallets.length === 0) return new Map()

      try {
        const res = await fetch('/api/profiles/by-wallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallets: uniqueWallets }),
        })
        if (!res.ok) return new Map()

        const data = await res.json()
        const map = new Map<string, SellerProfile>()

        for (const [wallet, info] of Object.entries(data.profiles || {})) {
          const { handle } = info as { handle: string }
          if (handle) {
            map.set(wallet, { wallet, handle })
          }
        }
        return map
      } catch {
        return new Map()
      }
    },
    enabled: uniqueWallets.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
