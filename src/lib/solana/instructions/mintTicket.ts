import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getProgram, getOrganizerPDA, getEventPDA, getTicketPDA, getPlatformPDA } from "../program";

export async function mintTicket(
  provider: AnchorProvider,
  eventPubkey: string,
  tierId: number,
  organizerAuthority: string
): Promise<{ signature: string; ticketPubkey: string }> {
  const program = getProgram(provider);
  const buyer = provider.wallet.publicKey;
  const eventPDA = new PublicKey(eventPubkey);

  const [platformPDA] = await getPlatformPDA();
  const platform = await program.account.platform.fetch(platformPDA);
  const [organizerPDA] = await getOrganizerPDA(new PublicKey(organizerAuthority));

  // Get event to find next ticket index
  const event = await program.account.event.fetch(eventPDA);
  const ticketIndex = new BN(event.totalTicketsSold);
  const [ticketPDA] = await getTicketPDA(eventPDA, ticketIndex);

  const tx = await program.methods
    .mintTicket(tierId, ticketIndex)
    .accounts({
      event: eventPDA,
      ticket: ticketPDA,
      organizer: organizerPDA,
      platform: platformPDA,
      feeWallet: platform.feeWallet,
      buyer,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, ticketPubkey: ticketPDA.toBase58() };
}