/**
 * Ticketly Program Configuration
 *
 * Onchain Luma — tokenised event ticketing on Solana
 * Program ID: GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs
 * IDL Account: GZeoXNYQsiwjttHW6Dp4DB3nyVm478QcJ8k2J1vUUDWs
 */

/**
 * Ticketly Program ID
 */
export const TICKETLY_PROGRAM_ID = 'GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs'

/**
 * IDL Account Public Key (for fetching IDL from chain)
 */
export const TICKETLY_IDL_ACCOUNT = 'GZeoXNYQsiwjttHW6Dp4DB3nyVm478QcJ8k2J1vUUDWs'

/**
 * Solana Token Program ID
 */
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

/**
 * Associated Token Program ID
 */
export const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'

/**
 * Ticketly program configuration
 */
export const TICKETLY_PROGRAM_CONFIG = {
  programId: TICKETLY_PROGRAM_ID,
  idlAccount: TICKETLY_IDL_ACCOUNT,
  devnetRpc: 'https://api.devnet.solana.com',
  mainnetRpc: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed' as const,
} as const

