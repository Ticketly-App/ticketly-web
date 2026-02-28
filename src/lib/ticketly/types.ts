import type { PublicKey } from '@solana/web3.js'

export enum TierType {
  GeneralAdmission = 0,
  EarlyBird = 1,
  Vip = 2,
  Vvip = 3,
  Custom = 4,
}

export interface GpsCoords {
  latMicro: number
  lngMicro: number
}

export interface TicketTier {
  tierType: TierType
  price: bigint
  supply: number
  minted: number
  checkedIn: number
  isOnSale: boolean
  saleStart: bigint
  saleEnd: bigint
}

export interface EventAccount {
  authority: PublicKey
  eventId: bigint
  name: string
  description: string
  venue: string
  metadataUri: string
  symbol: string
  gps: GpsCoords
  eventStart: bigint
  eventEnd: bigint
  createdAt: bigint
  ticketTiers: TicketTier[]
  totalMinted: bigint
  totalCheckedIn: bigint
  totalRevenue: bigint
  resaleAllowed: boolean
  maxResalePrice: bigint | null
  royaltyBps: number
  royaltyReceiver: PublicKey
  totalRoyalties: bigint
  gateOperators: PublicKey[]
  whitelistGated: boolean
  poapEnabled: boolean
  poapMetadataUri: string
  totalPoapsMinted: bigint
  isActive: boolean
  isCancelled: boolean
  bump: number
}

export interface TicketAccount {
  event: PublicKey
  mint: PublicKey
  owner: PublicKey
  originalBuyer: PublicKey
  ticketNumber: bigint
  tierIndex: number
  tierType: TierType
  pricePaid: bigint
  metadataUri: string
  isCheckedIn: boolean
  checkedInAt: bigint | null
  checkedInBy: PublicKey | null
  poapMinted: boolean
  isListed: boolean
  listedPrice: bigint | null
  resaleCount: number
  transferCount: number
  mintedAt: bigint
  lastTransferredAt: bigint | null
  bump: number
}

export interface ListingAccount {
  event: PublicKey
  ticket: PublicKey
  seller: PublicKey
  escrowAta: PublicKey
  price: bigint
  listedAt: bigint
  bump: number
}

export interface InitOrganizerParams {
  name: string
  website: string
  logoUri: string
}

export interface CreateEventParams {
  eventId: bigint
  name: string
  description: string
  venue: string
  metadataUri: string
  symbol: string
  gps: GpsCoords
  eventStart: bigint
  eventEnd: bigint
  ticketTiers: TicketTier[]
  resaleAllowed: boolean
  maxResalePrice: bigint | null
  royaltyBps: number
  whitelistGated: boolean
  poapEnabled: boolean
  poapMetadataUri: string
}

export interface UpdateEventParams {
  name?: string | null
  description?: string | null
  venue?: string | null
  metadataUri?: string | null
  eventStart?: bigint | null
  eventEnd?: bigint | null
  resaleAllowed?: boolean | null
  maxResalePrice?: bigint | null
  royaltyBps?: number | null
}

export interface MintTicketParams {
  tierIndex: number
  metadataUri: string
}


