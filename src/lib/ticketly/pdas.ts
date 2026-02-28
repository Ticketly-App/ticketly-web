import { PublicKey } from '@solana/web3.js'
import { TICKETLY_PROGRAM_ID, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from './program'

type PdaResult = [PublicKey, number]

function u64ToBytes(num: bigint | number): Uint8Array {
  const value = typeof num === 'bigint' ? num : BigInt(num)
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setBigUint64(0, value, true)
  return new Uint8Array(buffer)
}

export function findEventAddress(authority: PublicKey, eventId: bigint | number): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('event'), authority.toBuffer(), u64ToBytes(eventId)],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findTicketAddress(eventPda: PublicKey, ticketNumber: bigint | number): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('ticket'), eventPda.toBuffer(), u64ToBytes(ticketNumber)],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findOrganizerAddress(authority: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('organizer'), authority.toBuffer()],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findListingAddress(ticketPda: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), ticketPda.toBuffer()],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findWhitelistEntryAddress(eventPda: PublicKey, wallet: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('whitelist'), eventPda.toBuffer(), wallet.toBuffer()],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findTicketMintAddress(ticketPda: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('ticket_mint'), ticketPda.toBuffer()],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findAtaAddress(owner: PublicKey, mint: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), new PublicKey(TOKEN_PROGRAM_ID).toBuffer(), mint.toBuffer()],
    new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID),
  )
}

export function findPoapRecordAddress(ticketPda: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('poap'), ticketPda.toBuffer()],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findPoapMintAddress(ticketPda: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('poap_mint'), ticketPda.toBuffer()],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

export function findPlatformConfigAddress(): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('platform')],
    new PublicKey(TICKETLY_PROGRAM_ID),
  )
}

