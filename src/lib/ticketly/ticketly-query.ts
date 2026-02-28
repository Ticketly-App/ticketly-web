import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAccountByAddress, getProgramAccountsByType, type ProgramAccount } from './ticketly-accounts'
import type { EventAccount, ListingAccount, TicketAccount } from './types'

export type TicketlyEventAccount = ProgramAccount<EventAccount>
export type TicketlyListingAccount = ProgramAccount<ListingAccount>
export type TicketlyTicketAccount = ProgramAccount<TicketAccount>

export async function fetchEventAccounts(endpoint: string) {
  return await getProgramAccountsByType<EventAccount>(endpoint, 'EventAccount')
}

export async function fetchListingAccounts(endpoint: string) {
  return await getProgramAccountsByType<ListingAccount>(endpoint, 'ListingAccount')
}

export async function fetchTicketAccounts(endpoint: string) {
  return await getProgramAccountsByType<TicketAccount>(endpoint, 'TicketAccount')
}

export async function fetchEventAccount(endpoint: string, address: string) {
  return await getAccountByAddress<EventAccount>(endpoint, 'EventAccount', address)
}

export async function fetchListingAccount(endpoint: string, address: string) {
  return await getAccountByAddress<ListingAccount>(endpoint, 'ListingAccount', address)
}

export async function fetchTicketAccount(endpoint: string, address: string) {
  return await getAccountByAddress<TicketAccount>(endpoint, 'TicketAccount', address)
}

export function lamportsToSol(lamports: number | bigint) {
  const value = typeof lamports === 'bigint' ? Number(lamports) : lamports
  return value / LAMPORTS_PER_SOL
}


