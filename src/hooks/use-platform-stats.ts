'use client'

import { useQuery } from '@tanstack/react-query'

interface PlatformStats {
  totalEvents: number
  totalTicketsSold: number
  totalRevenueLamports: number
  totalRevenueSol: number
  totalCheckins: number
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  const res = await fetch('/api/stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export function usePlatformStats() {
  return useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: fetchPlatformStats,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
