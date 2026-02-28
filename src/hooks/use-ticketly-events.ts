'use client'

import { useQuery } from '@tanstack/react-query'
import { useCluster } from '@/components/cluster/cluster-data-access'
import type { TicketlyEventAccount } from '@/lib/ticketly/ticketly-query'
import { fetchEventAccounts, lamportsToSol } from '@/lib/ticketly/ticketly-query'
import type { EventAccount, TicketTier } from '@/lib/ticketly/types'

export interface TicketlyEvent {
  id: string
  publicKey: string
  authority: string
  name: string
  description: string
  venue: string
  metadataUri: string
  symbol: string
  eventStart: bigint
  eventEnd: bigint
  isActive: boolean
  isCancelled: boolean
  ticketTiers: TicketTier[]
  totalMinted: bigint
  totalCheckedIn: bigint
  totalRevenue: bigint
  resaleAllowed: boolean
  maxResalePrice: bigint | null
  whitelistGated: boolean
  poapEnabled: boolean
  royaltyBps: number
  lamports: number
  accountDataLen: number
}

export interface TicketTierInfo {
  tierIndex: number
  tierType: string
  price: bigint
  priceSol: number
  supply: number
  minted: number
  available: number
  isOnSale: boolean
  soldOut: boolean
}

function mapEventAccountToTicketlyEvent(data: TicketlyEventAccount): TicketlyEvent {
  const { pubkey, account } = data

  return {
    id: account.eventId.toString(),
    publicKey: pubkey,
    authority: account.authority.toBase58(),
    name: account.name,
    description: account.description,
    venue: account.venue,
    metadataUri: account.metadataUri,
    symbol: account.symbol,
    eventStart: account.eventStart,
    eventEnd: account.eventEnd,
    isActive: account.isActive,
    isCancelled: account.isCancelled,
    ticketTiers: account.ticketTiers,
    totalMinted: account.totalMinted,
    totalCheckedIn: account.totalCheckedIn,
    totalRevenue: account.totalRevenue,
    resaleAllowed: account.resaleAllowed,
    maxResalePrice: account.maxResalePrice,
    whitelistGated: account.whitelistGated,
    poapEnabled: account.poapEnabled,
    royaltyBps: account.royaltyBps,
    lamports: data.lamports,
    accountDataLen: data.accountDataLen,
  }
}

export function useTicketlyEvents(options?: { activeOnly?: boolean }) {
  const { cluster } = useCluster()

  return useQuery({
    queryKey: ['ticketly-events', { endpoint: cluster.endpoint, activeOnly: options?.activeOnly }],
    queryFn: async () => {
      const accounts = await fetchEventAccounts(cluster.endpoint)
      let events = accounts.map(mapEventAccountToTicketlyEvent)
      if (options?.activeOnly) {
        const now = BigInt(Math.floor(Date.now() / 1000))
        events = events.filter(
          (event) =>
            event.isActive && !event.isCancelled && event.eventStart <= now && event.eventEnd > now,
        )
      }
      return events
    },
  })
}

export function useTicketlyEvent(eventPublicKey?: string) {
  const { cluster } = useCluster()

  return useQuery({
    queryKey: ['ticketly-event', { endpoint: cluster.endpoint, eventPublicKey }],
    queryFn: async () => {
      const all = await fetchEventAccounts(cluster.endpoint)
      const found = all.find(
        (item) => item.pubkey === eventPublicKey || item.account.eventId.toString() === eventPublicKey,
      )
      return found ? mapEventAccountToTicketlyEvent(found) : null
    },
    enabled: !!eventPublicKey,
  })
}

export function mapTicketTier(tier: TicketTier, index: number): TicketTierInfo {
  const available = Math.max(0, tier.supply - tier.minted)
  return {
    tierIndex: index,
    tierType: tier.tierType.toString(),
    price: tier.price,
    priceSol: lamportsToSol(tier.price),
    supply: tier.supply,
    minted: tier.minted,
    available,
    isOnSale: tier.isOnSale,
    soldOut: available === 0,
  }
}

