import bs58 from 'bs58'
import { BN } from '@coral-xyz/anchor'
import { Buffer } from 'buffer'
import { PublicKey } from '@solana/web3.js'
import { getConnection } from './solana-connection'
import { TicketlyCoder, TicketlyIdl, TicketlyProgramId } from './ticketly-program'
import { ACCOUNT_DISCRIMINATORS } from './idl'

export type ProgramAccount<T> = {
  pubkey: string
  account: T
  lamports: number
  accountDataLen: number
}

/**
 * Convert a snake_case string to camelCase.
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

/**
 * Build a lookup of enum variant names → index from the IDL.
 * e.g. "GeneralAdmission" → 0, "EarlyBird" → 1, etc.
 */
const ENUM_VARIANT_INDEX: Record<string, number> = {}
for (const typeDef of (TicketlyIdl as any).types ?? []) {
  if (typeDef.type?.kind === 'enum') {
    for (let i = 0; i < typeDef.type.variants.length; i++) {
      ENUM_VARIANT_INDEX[typeDef.type.variants[i].name] = i
    }
  }
}

/**
 * Recursively transform decoded Anchor account data:
 * - snake_case keys → camelCase keys
 * - BN instances  → bigint
 * - Anchor enum objects ({ VariantName: {} }) → variant index number
 * - PublicKey instances are preserved
 * - Arrays and nested objects are recursed
 */
function transformDecoded(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof PublicKey) return obj
  if (BN.isBN(obj)) return BigInt(obj.toString())
  if (Array.isArray(obj)) return obj.map(transformDecoded)
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    // Detect Anchor enum: single key with empty-object value → convert to index
    if (entries.length === 1) {
      const [key, value] = entries[0]
      if (
        typeof value === 'object' &&
        value !== null &&
        Object.keys(value).length === 0 &&
        key in ENUM_VARIANT_INDEX
      ) {
        return ENUM_VARIANT_INDEX[key]
      }
    }
    const result: Record<string, unknown> = {}
    for (const [key, value] of entries) {
      result[snakeToCamel(key)] = transformDecoded(value)
    }
    return result
  }
  return obj
}

export async function getProgramAccountsByType<T>(endpoint: string, accountName: string): Promise<ProgramAccount<T>[]> {
  const connection = getConnection(endpoint)
  const discriminator = ACCOUNT_DISCRIMINATORS[accountName as keyof typeof ACCOUNT_DISCRIMINATORS]
  if (!discriminator) {
    throw new Error(`Unknown account discriminator for account type: ${accountName}`)
  }
  const accounts = await connection.getProgramAccounts(TicketlyProgramId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(discriminator),
        },
      },
    ],
  })

  return accounts.map((item) => ({
    pubkey: item.pubkey.toBase58(),
    account: transformDecoded(
      TicketlyCoder.accounts.decode(accountName, Buffer.from(item.account.data))
    ) as T,
    lamports: item.account.lamports,
    accountDataLen: item.account.data.length,
  }))
}

export async function getAccountByAddress<T>(endpoint: string, accountName: string, address: string) {
  const connection = getConnection(endpoint)
  const accountInfo = await connection.getAccountInfo(new PublicKey(address))
  if (!accountInfo) return null
  return transformDecoded(
    TicketlyCoder.accounts.decode(accountName, Buffer.from(accountInfo.data))
  ) as T
}

