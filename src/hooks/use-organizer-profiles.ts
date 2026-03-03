'use client'

import { useQuery } from '@tanstack/react-query'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { fetchOrganizerProfile } from '@/lib/ticketly/ticketly-query'
import type { OrganizerProfileAccount } from '@/lib/ticketly/types'

export interface OrganizerInfo {
  authority: string
  name: string
  /** Clean X handle extracted from the on-chain "website" field */
  username: string | null
  logoUri: string
  website: string
  totalEvents: number
  totalTickets: number
  totalRevenueSol: number
}

/**
 * Extract a clean X/Twitter handle from the on-chain website field.
 * Handles formats like: @handle, handle, https://x.com/handle,
 * https://twitter.com/handle, https://ticketly.dev (returns null for non-X URLs).
 */
export function extractXHandle(raw: string | undefined | null): string | null {
  if (!raw || !raw.trim()) return null
  let s = raw.trim()

  // Strip leading @
  if (s.startsWith('@')) s = s.slice(1)

  // x.com/handle or twitter.com/handle
  const xMatch = s.match(/(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/i)
  if (xMatch) return xMatch[1]

  // If it's a URL (contains :// or .) but NOT x.com/twitter.com, it's a website, not a handle
  if (s.includes('://') || s.includes('.')) return null

  // Plain word with valid handle chars → treat as handle
  if (/^[A-Za-z0-9_]{1,15}$/.test(s)) return s

  return null
}

/**
 * Batch-fetch organizer profiles for a list of authority pubkeys.
 * Returns a Map<authority, OrganizerInfo> for O(1) lookups.
 */
export function useOrganizerProfiles(authorities: string[]) {
  const { cluster } = useCluster()
  const uniqueAuthorities = [...new Set(authorities.filter(Boolean))]

  return useQuery({
    queryKey: ['organizer-profiles', uniqueAuthorities.sort().join(',')],
    queryFn: async (): Promise<Map<string, OrganizerInfo>> => {
      const results = await Promise.allSettled(
        uniqueAuthorities.map((auth) => fetchOrganizerProfile(cluster.endpoint, auth))
      )

      const map = new Map<string, OrganizerInfo>()
      results.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          const profile = result.value
          map.set(uniqueAuthorities[i], {
            authority: profile.authority,
            name: profile.name,
            username: extractXHandle(profile.website),
            logoUri: profile.logoUri,
            website: profile.website,
            totalEvents: Number(profile.totalEvents),
            totalTickets: Number(profile.totalTickets),
            totalRevenueSol: Number(profile.totalRevenue) / 1_000_000_000,
          })
        }
      })
      return map
    },
    enabled: uniqueAuthorities.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
