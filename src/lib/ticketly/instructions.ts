import { Buffer } from 'buffer'
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { TICKETLY_PROGRAM_ID, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from './program'
import { INSTRUCTION_DISCRIMINATORS } from './idl'
import {
  findEventAddress,
  findTicketAddress,
  findOrganizerAddress,
  findListingAddress,
  findWhitelistEntryAddress,
  findTicketMintAddress,
  findAtaAddress,
  findPoapRecordAddress,
  findPoapMintAddress,
  findPlatformConfigAddress,
} from './pdas'
import type { CreateEventParams, InitOrganizerParams, MintTicketParams, UpdateEventParams } from './types'

// ─── Encoding Helpers ────────────────────────────────────────────────────────

function concatBuffers(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers as any)
}

function encodeInstruction(discriminator: Uint8Array, args: Buffer[] = []): Buffer {
  const buffers: Buffer[] = [Buffer.from(discriminator)]
  for (const arg of args) {
    buffers.push(arg)
  }
  return concatBuffers(buffers)
}

function encodeString(str: string): Buffer {
  const strBytes = Buffer.from(str, 'utf-8')
  const lenBytes = Buffer.allocUnsafe(4)
  lenBytes.writeUInt32LE(strBytes.length)
  return concatBuffers([lenBytes, strBytes])
}

function encodeU64(value: bigint | number): Buffer {
  const buf = Buffer.allocUnsafe(8)
  buf.writeBigUInt64LE(typeof value === 'bigint' ? value : BigInt(value))
  return buf
}

function encodeI64(value: bigint | number): Buffer {
  const buf = Buffer.allocUnsafe(8)
  buf.writeBigInt64LE(typeof value === 'bigint' ? value : BigInt(value))
  return buf
}

function encodeU32(value: number): Buffer {
  const buf = Buffer.allocUnsafe(4)
  buf.writeUInt32LE(value)
  return buf
}

function encodeU16(value: number): Buffer {
  const buf = Buffer.allocUnsafe(2)
  buf.writeUInt16LE(value)
  return buf
}

function encodeU8(value: number): Buffer {
  return Buffer.from([value])
}

function encodeBool(value: boolean): Buffer {
  return encodeU8(value ? 1 : 0)
}

function encodeOptionU64(value: bigint | null): Buffer {
  if (value === null) return Buffer.from([0])
  return concatBuffers([Buffer.from([1]), encodeU64(value)])
}

function encodeOptionI64(value: bigint | null): Buffer {
  if (value === null) return Buffer.from([0])
  return concatBuffers([Buffer.from([1]), encodeI64(value)])
}

function encodeOptionBool(value: boolean | null): Buffer {
  if (value === null) return Buffer.from([0])
  return concatBuffers([Buffer.from([1]), encodeBool(value)])
}

function encodeOptionU16(value: number | null): Buffer {
  if (value === null) return Buffer.from([0])
  return concatBuffers([Buffer.from([1]), encodeU16(value)])
}

function encodeOptionString(value: string | null): Buffer {
  if (value === null) return Buffer.from([0])
  return concatBuffers([Buffer.from([1]), encodeString(value)])
}

function encodeOptionPubkey(value: PublicKey | null): Buffer {
  if (value === null) return Buffer.from([0])
  return concatBuffers([Buffer.from([1]), value.toBuffer()])
}

/** Option<Option<u64>> for double-nested optionals like max_resale_price in UpdateEventParams */
function encodeOptionOptionU64(value: bigint | null | undefined): Buffer {
  if (value === undefined) return Buffer.from([0]) // outer None = don't change
  if (value === null) return concatBuffers([Buffer.from([1]), Buffer.from([0])]) // Some(None) = clear
  return concatBuffers([Buffer.from([1]), Buffer.from([1]), encodeU64(value)]) // Some(Some(val))
}

function encodeGpsCoords(gps: { latMicro: number; lngMicro: number }): Buffer {
  const buf = Buffer.allocUnsafe(8)
  buf.writeInt32LE(gps.latMicro, 0)
  buf.writeInt32LE(gps.lngMicro, 4)
  return buf
}

function encodeTicketTier(tier: {
  tierType: number
  price: bigint
  supply: number
  minted: number
  checkedIn: number
  isOnSale: boolean
  saleStart: bigint
  saleEnd: bigint
}): Buffer {
  return concatBuffers([
    encodeU8(tier.tierType),
    encodeU64(tier.price),
    encodeU32(tier.supply),
    encodeU32(tier.minted),
    encodeU32(tier.checkedIn),
    encodeBool(tier.isOnSale),
    encodeI64(tier.saleStart),
    encodeI64(tier.saleEnd),
  ])
}

function encodeTicketTierVector(tiers: any[]): Buffer {
  const tierBuffers = tiers.map(encodeTicketTier)
  return concatBuffers([encodeU32(tiers.length), ...tierBuffers])
}

const PROGRAM_ID = new PublicKey(TICKETLY_PROGRAM_ID)
const TOKEN_PID = new PublicKey(TOKEN_PROGRAM_ID)
const ATA_PID = new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID)

// ─── Platform ────────────────────────────────────────────────────────────────

export function initPlatformInstruction(
  admin: PublicKey,
  protocolFeeBps: number,
): TransactionInstruction {
  const [platformConfig] = findPlatformConfigAddress()

  return new TransactionInstruction({
    keys: [
      { pubkey: platformConfig, isSigner: false, isWritable: true },
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.InitPlatform, [encodeU16(protocolFeeBps)]),
  })
}

export function updatePlatformInstruction(
  admin: PublicKey,
  params: { protocolFeeBps?: number | null; feeReceiver?: PublicKey | null; creationPaused?: boolean | null },
): TransactionInstruction {
  const [platformConfig] = findPlatformConfigAddress()

  return new TransactionInstruction({
    keys: [
      { pubkey: platformConfig, isSigner: false, isWritable: true },
      { pubkey: admin, isSigner: true, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.UpdatePlatform, [
      encodeOptionU16(params.protocolFeeBps ?? null),
      encodeOptionPubkey(params.feeReceiver ?? null),
      encodeOptionBool(params.creationPaused ?? null),
    ]),
  })
}

// ─── Organizer ───────────────────────────────────────────────────────────────

export function initOrganizerInstruction(authority: PublicKey, params: InitOrganizerParams): TransactionInstruction {
  const [organizerPda] = findOrganizerAddress(authority)

  return new TransactionInstruction({
    keys: [
      { pubkey: organizerPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.InitOrganizer, [
      encodeString(params.name),
      encodeString(params.website),
      encodeString(params.logoUri),
    ]),
  })
}

export function updateOrganizerInstruction(authority: PublicKey, params: InitOrganizerParams): TransactionInstruction {
  const [organizerPda] = findOrganizerAddress(authority)

  return new TransactionInstruction({
    keys: [
      { pubkey: organizerPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.UpdateOrganizer, [
      encodeString(params.name),
      encodeString(params.website),
      encodeString(params.logoUri),
    ]),
  })
}

// ─── Event Lifecycle ─────────────────────────────────────────────────────────

export function createEventInstruction(authority: PublicKey, params: CreateEventParams): TransactionInstruction {
  const [eventPda] = findEventAddress(authority, params.eventId)
  const [organizerPda] = findOrganizerAddress(authority)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: organizerPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.CreateEvent, [
      encodeU64(params.eventId),
      encodeString(params.name),
      encodeString(params.description),
      encodeString(params.venue),
      encodeString(params.metadataUri),
      encodeString(params.symbol),
      encodeGpsCoords(params.gps),
      encodeI64(params.eventStart),
      encodeI64(params.eventEnd),
      encodeTicketTierVector(params.ticketTiers),
      encodeBool(params.resaleAllowed),
      encodeOptionU64(params.maxResalePrice),
      encodeU16(params.royaltyBps),
      encodeBool(params.whitelistGated),
      encodeBool(params.poapEnabled),
      encodeString(params.poapMetadataUri),
    ]),
  })
}

export function updateEventInstruction(
  authority: PublicKey,
  eventId: bigint,
  params: UpdateEventParams,
): TransactionInstruction {
  const [eventPda] = findEventAddress(authority, eventId)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.UpdateEvent, [
      encodeOptionString(params.name ?? null),
      encodeOptionString(params.description ?? null),
      encodeOptionString(params.venue ?? null),
      encodeOptionString(params.metadataUri ?? null),
      encodeOptionI64(params.eventStart ?? null),
      encodeOptionI64(params.eventEnd ?? null),
      encodeOptionBool(params.resaleAllowed ?? null),
      encodeOptionOptionU64(params.maxResalePrice),
      encodeOptionU16(params.royaltyBps ?? null),
    ]),
  })
}

export function cancelEventInstruction(
  authority: PublicKey,
  eventId: bigint,
): TransactionInstruction {
  const [eventPda] = findEventAddress(authority, eventId)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.CancelEvent, []),
  })
}

// ─── Ticket Minting ──────────────────────────────────────────────────────────

export function mintTicketInstruction(
  eventAuthority: PublicKey,
  eventId: bigint,
  recipient: PublicKey,
  payer: PublicKey,
  ticketNumber: bigint,
  params: MintTicketParams,
  tokenMetadataProgram: PublicKey,
  whitelistGated = false,
): TransactionInstruction {
  const [eventPda] = findEventAddress(eventAuthority, eventId)
  const [ticketPda] = findTicketAddress(eventPda, ticketNumber)
  const [mintPda] = findTicketMintAddress(ticketPda)
  const [recipientAta] = findAtaAddress(recipient, mintPda)

  // For Option<Account>, pass the program ID when the account is None (non-whitelist events)
  const whitelistEntryKey = whitelistGated
    ? findWhitelistEntryAddress(eventPda, payer)[0]
    : PROGRAM_ID

  // metadata_account: Metaplex token metadata PDA
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), tokenMetadataProgram.toBuffer(), mintPda.toBuffer()],
    tokenMetadataProgram,
  )

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: ticketPda, isSigner: false, isWritable: true },
      { pubkey: mintPda, isSigner: false, isWritable: true },
      { pubkey: recipientAta, isSigner: false, isWritable: true },
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: whitelistEntryKey, isSigner: false, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PID, isSigner: false, isWritable: false },
      { pubkey: ATA_PID, isSigner: false, isWritable: false },
      { pubkey: tokenMetadataProgram, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.MintTicket, [
      encodeU8(params.tierIndex),
      encodeString(params.metadataUri),
    ]),
  })
}

// ─── Check-In ────────────────────────────────────────────────────────────────

export function checkInTicketInstruction(
  eventPubkey: PublicKey,
  ticketPubkey: PublicKey,
  mint: PublicKey,
  attendee: PublicKey,
  gateOperator: PublicKey,
  tokenMetadataProgram: PublicKey,
): TransactionInstruction {
  const [attendeeAta] = findAtaAddress(attendee, mint)
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), tokenMetadataProgram.toBuffer(), mint.toBuffer()],
    tokenMetadataProgram,
  )

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPubkey, isSigner: false, isWritable: true },
      { pubkey: ticketPubkey, isSigner: false, isWritable: true },
      { pubkey: attendeeAta, isSigner: false, isWritable: true },
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: attendee, isSigner: false, isWritable: false },
      { pubkey: gateOperator, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PID, isSigner: false, isWritable: false },
      { pubkey: tokenMetadataProgram, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.CheckInTicket, []),
  })
}

// ─── Transfer ────────────────────────────────────────────────────────────────

export function transferTicketInstruction(
  eventPubkey: PublicKey,
  ticketPubkey: PublicKey,
  mint: PublicKey,
  sender: PublicKey,
  recipient: PublicKey,
): TransactionInstruction {
  const [senderAta] = findAtaAddress(sender, mint)
  const [recipientAta] = findAtaAddress(recipient, mint)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPubkey, isSigner: false, isWritable: true },
      { pubkey: ticketPubkey, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: senderAta, isSigner: false, isWritable: true },
      { pubkey: recipientAta, isSigner: false, isWritable: true },
      { pubkey: sender, isSigner: true, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PID, isSigner: false, isWritable: false },
      { pubkey: ATA_PID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.TransferTicket, []),
  })
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

export function listTicketInstruction(
  eventPubkey: PublicKey,
  ticketPubkey: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
  price: bigint,
): TransactionInstruction {
  const [listingPda] = findListingAddress(ticketPubkey)
  const [sellerAta] = findAtaAddress(seller, mint)
  const [escrowAta] = findAtaAddress(listingPda, mint)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPubkey, isSigner: false, isWritable: true },
      { pubkey: ticketPubkey, isSigner: false, isWritable: true },
      { pubkey: listingPda, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: sellerAta, isSigner: false, isWritable: true },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: seller, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PID, isSigner: false, isWritable: false },
      { pubkey: ATA_PID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.ListTicket, [encodeU64(price)]),
  })
}

export function cancelListingInstruction(
  eventPubkey: PublicKey,
  ticketPubkey: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
): TransactionInstruction {
  const [listingPda] = findListingAddress(ticketPubkey)
  const [escrowAta] = findAtaAddress(listingPda, mint)
  const [sellerAta] = findAtaAddress(seller, mint)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPubkey, isSigner: false, isWritable: false },
      { pubkey: ticketPubkey, isSigner: false, isWritable: true },
      { pubkey: listingPda, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: sellerAta, isSigner: false, isWritable: true },
      { pubkey: seller, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PID, isSigner: false, isWritable: false },
      { pubkey: ATA_PID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.CancelListing, []),
  })
}

export function buyTicketInstruction(params: {
  event: PublicKey
  ticket: PublicKey
  listing: PublicKey
  mint: PublicKey
  seller: PublicKey
  royaltyReceiver: PublicKey
  buyer: PublicKey
}): TransactionInstruction {
  const [escrowAta] = findAtaAddress(params.listing, params.mint)
  const [buyerAta] = findAtaAddress(params.buyer, params.mint)

  return new TransactionInstruction({
    keys: [
      { pubkey: params.event, isSigner: false, isWritable: true },
      { pubkey: params.ticket, isSigner: false, isWritable: true },
      { pubkey: params.listing, isSigner: false, isWritable: true },
      { pubkey: params.mint, isSigner: false, isWritable: false },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: buyerAta, isSigner: false, isWritable: true },
      { pubkey: params.seller, isSigner: false, isWritable: true },
      { pubkey: params.royaltyReceiver, isSigner: false, isWritable: true },
      { pubkey: params.buyer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PID, isSigner: false, isWritable: false },
      { pubkey: ATA_PID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.BuyTicket, []),
  })
}

// ─── Access Control ──────────────────────────────────────────────────────────

export function addOperatorInstruction(
  eventAuthority: PublicKey,
  eventId: bigint,
  operator: PublicKey,
): TransactionInstruction {
  const [eventPda] = findEventAddress(eventAuthority, eventId)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: true, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.AddOperator, [operator.toBuffer()]),
  })
}

export function removeOperatorInstruction(
  eventAuthority: PublicKey,
  eventId: bigint,
  operator: PublicKey,
): TransactionInstruction {
  const [eventPda] = findEventAddress(eventAuthority, eventId)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: true, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.RemoveOperator, [operator.toBuffer()]),
  })
}

export function addWhitelistEntryInstruction(
  eventAuthority: PublicKey,
  eventId: bigint,
  wallet: PublicKey,
  allocation: number,
): TransactionInstruction {
  const [eventPda] = findEventAddress(eventAuthority, eventId)
  const [whitelistPda] = findWhitelistEntryAddress(eventPda, wallet)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: whitelistPda, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.AddWhitelistEntry, [
      wallet.toBuffer(),
      encodeU8(allocation),
    ]),
  })
}

export function removeWhitelistEntryInstruction(
  eventAuthority: PublicKey,
  eventId: bigint,
  wallet: PublicKey,
): TransactionInstruction {
  const [eventPda] = findEventAddress(eventAuthority, eventId)
  const [whitelistPda] = findWhitelistEntryAddress(eventPda, wallet)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: false },
      { pubkey: whitelistPda, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: true, isWritable: true },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.RemoveWhitelistEntry, []),
  })
}

// ─── Revenue ─────────────────────────────────────────────────────────────────

export function withdrawRevenueInstruction(
  eventAuthority: PublicKey,
  eventId: bigint,
  amount: bigint | null,
): TransactionInstruction {
  const [eventPda] = findEventAddress(eventAuthority, eventId)

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPda, isSigner: false, isWritable: true },
      { pubkey: eventAuthority, isSigner: true, isWritable: true },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.WithdrawRevenue, [
      encodeOptionU64(amount),
    ]),
  })
}

// ─── POAP ────────────────────────────────────────────────────────────────────

export function mintPoapInstruction(
  eventPubkey: PublicKey,
  ticketPubkey: PublicKey,
  holder: PublicKey,
  payer: PublicKey,
  tokenMetadataProgram: PublicKey,
): TransactionInstruction {
  const [poapRecord] = findPoapRecordAddress(ticketPubkey)
  const [poapMint] = findPoapMintAddress(ticketPubkey)
  const [holderAta] = findAtaAddress(holder, poapMint)
  const [poapMetadataAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), tokenMetadataProgram.toBuffer(), poapMint.toBuffer()],
    tokenMetadataProgram,
  )

  return new TransactionInstruction({
    keys: [
      { pubkey: eventPubkey, isSigner: false, isWritable: true },
      { pubkey: ticketPubkey, isSigner: false, isWritable: true },
      { pubkey: poapRecord, isSigner: false, isWritable: true },
      { pubkey: poapMint, isSigner: false, isWritable: true },
      { pubkey: holderAta, isSigner: false, isWritable: true },
      { pubkey: poapMetadataAccount, isSigner: false, isWritable: true },
      { pubkey: holder, isSigner: false, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PID, isSigner: false, isWritable: false },
      { pubkey: ATA_PID, isSigner: false, isWritable: false },
      { pubkey: tokenMetadataProgram, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: encodeInstruction(INSTRUCTION_DISCRIMINATORS.MintPoap, []),
  })
}
