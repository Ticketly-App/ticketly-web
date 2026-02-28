import { BorshAccountsCoder, BorshCoder, type Idl } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { TICKETLY_IDL } from './idl-raw'
import { TICKETLY_PROGRAM_ID } from './program'

export const TicketlyIdl = TICKETLY_IDL as unknown as Idl
export const TicketlyProgramId = new PublicKey(TICKETLY_PROGRAM_ID)
export const TicketlyCoder = new BorshCoder(TicketlyIdl)
export const TicketlyAccountsCoder = new BorshAccountsCoder(TicketlyIdl)

