'use client'

import { useQuery } from '@tanstack/react-query'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { fetchListingAccounts, lamportsToSol, type TicketlyListingAccount } from '@/lib/ticketly/ticketly-query'

export interface TicketlyListing {
  id: string
  publicKey: string
  ticketKey: string
  eventKey: string
  seller: string
  price: bigint
  priceSol: number
  listedAt: bigint
}

function mapListingAccountToTicketlyListing(data: TicketlyListingAccount): TicketlyListing {
  const { pubkey, account } = data
  return {
    id: pubkey,
    publicKey: pubkey,
    ticketKey: account.ticket.toBase58(),
    eventKey: account.event.toBase58(),
    seller: account.seller.toBase58(),
    price: account.price,
    priceSol: lamportsToSol(account.price),
    listedAt: account.listedAt,
  }
}

export function useTicketlyListings() {
  const { cluster } = useCluster()

  return useQuery({
    queryKey: ['ticketly-listings', { endpoint: cluster.endpoint }],
    queryFn: async () => {
      const listings = await fetchListingAccounts(cluster.endpoint)
      return listings.map(mapListingAccountToTicketlyListing).sort((a, b) =>
        Number(b.listedAt - a.listedAt),
      )
    },
  })
}

