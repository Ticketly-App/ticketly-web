import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getProgram, getOrganizerPDA, getEventPDA, getPlatformPDA } from "../program";
import { GpsCoords, TicketTier } from "@/lib/ticketly/types";

export interface CreateEventParams {
  name: string;
  description: string;
  imageUri: string;
  startTime: number;
  endTime: number;
  venue: string;
  location?: GpsCoords;
  categories: string[];
  tiers: TicketTier[];
  whitelistEnabled: boolean;
  poapEnabled: boolean;
  resaleEnabled: boolean;
  maxResalePercent: number;
}

export async function createEvent(
  provider: AnchorProvider,
  params: CreateEventParams
): Promise<{ signature: string; eventPubkey: string }> {
  const program = getProgram(provider);
  const authority = provider.wallet.publicKey;

  const [organizerPDA] = await getOrganizerPDA(authority);
  const [platformPDA] = await getPlatformPDA();

  // Fetch organizer to get totalEvents for ID
  let eventId: BN;
  try {
    const organizer = await program.account.organizer.fetch(organizerPDA);
    eventId = new BN(organizer.totalEvents);
  } catch {
    eventId = new BN(0);
  }

  const [eventPDA] = await getEventPDA(organizerPDA, eventId);

  const tx = await program.methods
    .createEvent(
      params.name,
      params.description,
      params.imageUri,
      new BN(params.startTime),
      new BN(params.endTime),
      params.venue,
      params.location || null,
      params.categories,
      params.tiers.map(t => ({
        ...t,
        price: new BN(t.price),
        tierType: { [t.tierType.toLowerCase()]: {} }
      })),
      params.whitelistEnabled,
      params.poapEnabled,
      params.resaleEnabled,
      params.maxResalePercent,
      eventId
    )
    .accounts({
      event: eventPDA,
      organizer: organizerPDA,
      authority,
      platform: platformPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, eventPubkey: eventPDA.toBase58() };
}
