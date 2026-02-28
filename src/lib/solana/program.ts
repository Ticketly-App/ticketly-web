import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { IDL, PROGRAM_ID } from "../idl";

export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
export const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as "devnet" | "mainnet-beta";

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC, "confirmed");
}

export function getProgramId(): PublicKey {
  return new PublicKey(PROGRAM_ID);
}

export function getProgram(provider: AnchorProvider) {
  return new Program(IDL as any, getProgramId(), provider);
}

// PDA Helpers
export async function getPlatformPDA(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    getProgramId()
  );
}

export async function getOrganizerPDA(authority: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("organizer"), authority.toBuffer()],
    getProgramId()
  );
}

export async function getEventPDA(organizer: PublicKey, eventId: BN): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("event"), organizer.toBuffer(), eventId.toArrayLike(Buffer, "le", 8)],
    getProgramId()
  );
}

export async function getTicketPDA(event: PublicKey, ticketIndex: BN): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("ticket"), event.toBuffer(), ticketIndex.toArrayLike(Buffer, "le", 8)],
    getProgramId()
  );
}

export async function getOperatorPDA(event: PublicKey, operatorKey: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("operator"), event.toBuffer(), operatorKey.toBuffer()],
    getProgramId()
  );
}

export async function getWhitelistEntryPDA(event: PublicKey, wallet: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("whitelist"), event.toBuffer(), wallet.toBuffer()],
    getProgramId()
  );
}

export async function getListingPDA(ticket: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("listing"), ticket.toBuffer()],
    getProgramId()
  );
}

export async function getPoapPDA(ticket: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("poap"), ticket.toBuffer()],
    getProgramId()
  );
}

export function lamportsToSol(lamports: number | bigint): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): BN {
  return new BN(Math.floor(sol * LAMPORTS_PER_SOL));
}

export function formatSol(lamports: number | bigint): string {
  return `${(Number(lamports) / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
}
