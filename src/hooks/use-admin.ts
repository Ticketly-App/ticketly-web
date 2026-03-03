'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

/**
 * Checks admin status via server-side API.
 * The admin wallet is NEVER exposed to the client bundle.
 */
export function useIsAdmin(): boolean {
  const { publicKey } = useWallet()
  const wallet = publicKey?.toBase58() || ''

  const { data } = useQuery({
    queryKey: ['admin-check', wallet],
    queryFn: async () => {
      const res = await fetch(`/api/admin/check?wallet=${wallet}`)
      if (!res.ok) return { isAdmin: false }
      return res.json() as Promise<{ isAdmin: boolean }>
    },
    enabled: !!wallet,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

  return data?.isAdmin ?? false
}
