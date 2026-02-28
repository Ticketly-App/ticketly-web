import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getProgram, getListingPDA, getPlatformPDA } from "../program";

export async function listTicket(
  provider: AnchorProvider,
  eventPubkey: string,
  ticketPubkey: string,
  priceLamports: number
): Promise<{ signature: string; listingPubkey: string }> {
  const program = getProgram(provider);
  const owner = provider.wallet.publicKey;
  const ticketPDA = new PublicKey(ticketPubkey);
  const [listingPDA] = await getListingPDA(ticketPDA);

  const tx = await program.methods
    .listTicket(new BN(priceLamports))
    .accounts({
      event: new PublicKey(eventPubkey),
      ticket: ticketPDA,
      listing: listingPDA,
      owner,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, listingPubkey: listingPDA.toBase58() };
}

export async function buyTicketFromMarketplace(
  provider: AnchorProvider,
  eventPubkey: string,
  ticketPubkey: string,
  sellerPubkey: string
): Promise<string> {
  const program = getProgram(provider);
  const buyer = provider.wallet.publicKey;
  const ticketPDA = new PublicKey(ticketPubkey);
  const [listingPDA] = await getListingPDA(ticketPDA);
  const [platformPDA] = await getPlatformPDA();
  const platform = await program.account.platform.fetch(platformPDA);

  const tx = await program.methods
    .buyTicket()
    .accounts({
      event: new PublicKey(eventPubkey),
      ticket: ticketPDA,
      listing: listingPDA,
      seller: new PublicKey(sellerPubkey),
      platform: platformPDA,
      feeWallet: platform.feeWallet,
      buyer,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function cancelListing(
  provider: AnchorProvider,
  ticketPubkey: string
): Promise<string> {
  const program = getProgram(provider);
  const owner = provider.wallet.publicKey;
  const ticketPDA = new PublicKey(ticketPubkey);
  const [listingPDA] = await getListingPDA(ticketPDA);

  const tx = await program.methods
    .cancelListing()
    .accounts({
      ticket: ticketPDA,
      listing: listingPDA,
      owner,
    })
    .rpc();

  return tx;
}