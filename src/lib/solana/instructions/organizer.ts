import { AnchorProvider } from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { getProgram, getOrganizerPDA } from "../program";

export async function initOrganizer(
  provider: AnchorProvider,
  name: string,
  description: string,
  imageUri: string,
  website?: string,
  twitter?: string
): Promise<{ signature: string; organizerPubkey: string }> {
  const program = getProgram(provider);
  const authority = provider.wallet.publicKey;
  const [organizerPDA] = await getOrganizerPDA(authority);

  const tx = await program.methods
    .initOrganizer(name, description, imageUri, website || null, twitter || null)
    .accounts({
      organizer: organizerPDA,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, organizerPubkey: organizerPDA.toBase58() };
}

export async function updateOrganizer(
  provider: AnchorProvider,
  name?: string,
  description?: string,
  imageUri?: string,
  website?: string,
  twitter?: string
): Promise<string> {
  const program = getProgram(provider);
  const authority = provider.wallet.publicKey;
  const [organizerPDA] = await getOrganizerPDA(authority);

  const tx = await program.methods
    .updateOrganizer(
      name || null,
      description || null,
      imageUri || null,
      website || null,
      twitter || null
    )
    .accounts({
      organizer: organizerPDA,
      authority,
    })
    .rpc();

  return tx;
}