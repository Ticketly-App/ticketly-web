import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getProgram, getOperatorPDA } from "../program";

export async function checkInTicket(
  provider: AnchorProvider,
  eventPubkey: string,
  ticketPubkey: string
): Promise<string> {
  const program = getProgram(provider);
  const authority = provider.wallet.publicKey;
  const eventPDA = new PublicKey(eventPubkey);

  const [operatorPDA] = await getOperatorPDA(eventPDA, authority);

  const tx = await program.methods
    .checkInTicket()
    .accounts({
      event: eventPDA,
      ticket: new PublicKey(ticketPubkey),
      operator: operatorPDA,
      authority,
    })
    .rpc();

  return tx;
}