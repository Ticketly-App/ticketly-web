'use client'

import { useQuery } from '@tanstack/react-query'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchTicketAccounts, lamportsToSol, type TicketlyTicketAccount } from '@/lib/ticketly/ticketly-query'

export type TicketlyTicketStatus = 'valid' | 'checked_in' | 'listed' | 'expired'

export interface TicketlyTicket {
  id: string
  publicKey: string
  eventKey: string
  owner: string
  ticketNumber: bigint
  tierIndex: number
  tierType: string
  pricePaid: bigint
  pricePaidSol: number
  metadataUri: string
  isCheckedIn: boolean
  isListed: boolean
  listedPrice: bigint | null
  listedPriceSol: number | null
  mintedAt: bigint
  status: TicketlyTicketStatus
}

function getTicketStatus(ticket: TicketlyTicketAccount): TicketlyTicketStatus {
  const { account } = ticket
  if (account.isCheckedIn) return 'checked_in'
  if (account.isListed) return 'listed'
  return 'valid'
}

function mapTicketAccountToTicketlyTicket(data: TicketlyTicketAccount): TicketlyTicket {
  const { pubkey, account } = data

  return {
    id: pubkey,
    publicKey: pubkey,
    eventKey: account.event.toBase58(),
    owner: account.owner.toBase58(),
    ticketNumber: account.ticketNumber,
    tierIndex: account.tierIndex,
    tierType: account.tierType.toString(),
    pricePaid: account.pricePaid,
    pricePaidSol: lamportsToSol(account.pricePaid),
    metadataUri: account.metadataUri,
    isCheckedIn: account.isCheckedIn,
    isListed: account.isListed,
    listedPrice: account.listedPrice,
    listedPriceSol: account.listedPrice ? lamportsToSol(account.listedPrice) : null,
    mintedAt: account.mintedAt,
    status: getTicketStatus(data),
  }
}

export function useTicketlyTickets() {
  const { cluster } = useCluster()
  const { publicKey } = useWallet()

  return useQuery({
    queryKey: ['ticketly-tickets', { endpoint: cluster.endpoint, owner: publicKey?.toBase58() }],
    queryFn: async () => {
      if (!publicKey) return []
      const allTickets = await fetchTicketAccounts(cluster.endpoint)
      const owned = allTickets.filter((item) => item.account.owner.toBase58() === publicKey.toBase58())
      const mapped = owned.map(mapTicketAccountToTicketlyTicket)
      return mapped.sort((a, b) => Number(b.mintedAt - a.mintedAt))
    },
    enabled: !!publicKey,
  })
}

