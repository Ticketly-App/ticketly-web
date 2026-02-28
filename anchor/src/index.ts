import type { AnchorProvider } from '@coral-xyz/anchor'
import { PublicKey, type Cluster } from '@solana/web3.js'

const DEFAULT_BASIC_PROGRAM_ID = new PublicKey('GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs')

export function getBasicProgramId(_cluster: Cluster): PublicKey {
  return DEFAULT_BASIC_PROGRAM_ID
}

export function getBasicProgram(_provider: AnchorProvider, _programId: PublicKey) {
  return {
    methods: {
      greet: () => ({
        rpc: async () => 'basic-program-unavailable-mock-signature',
      }),
    },
  } as const
}