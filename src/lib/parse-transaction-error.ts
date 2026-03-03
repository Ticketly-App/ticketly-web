/**
 * Parse Solana/Anchor transaction errors into user-friendly messages.
 * Maps on-chain program error codes to readable descriptions.
 */

/** Anchor error offset: custom errors start at 6000 */
const PROGRAM_ERRORS: Record<number, string> = {
  // Event validation
  6000: 'Event name is too long (max 50 characters).',
  6001: 'Event description is too long (max 200 characters).',
  6002: 'Venue name is too long (max 100 characters).',
  6003: 'Metadata URI is too long (max 200 characters).',
  6004: 'Symbol is too long (max 10 characters).',
  6005: 'Must define 1–5 ticket tiers.',
  6006: 'Tier supply must be at least 1.',
  6007: 'Ticket price must be ≥ 0 lamports.',
  6008: 'Royalty must be ≤ 20%.',
  6009: 'Event start must be in the future.',
  6010: 'Event end must be after event start.',

  // Event state
  6011: 'This event is not currently active.',
  6012: 'This event has already ended.',
  6013: 'Check-in opens 1 hour before the event starts.',
  6014: 'This event has been cancelled.',
  6015: 'Cannot cancel — at least one attendee has already checked in.',

  // Tier / minting
  6016: 'This tier is sold out.',
  6017: 'Invalid tier index.',
  6018: 'This tier is not currently on sale.',
  6019: 'Tier sale has not started yet.',
  6020: 'Tier sale window has ended.',

  // Ticket actions
  6021: 'This ticket has already been checked in.',
  6022: 'This ticket has not been checked in yet.',
  6023: 'This ticket does not belong to the specified event.',
  6024: 'You do not own this ticket.',
  6025: 'Ticket is listed for resale — cancel the listing first.',
  6026: 'This ticket is not listed for resale.',

  // Token checks
  6027: 'Token mint does not match the ticket record.',
  6028: 'Token account has zero balance.',
  6029: 'Token account authority mismatch.',

  // Marketplace
  6030: 'Resale is not enabled for this event.',
  6031: 'Listing price exceeds the resale price cap.',
  6032: 'You already own this ticket.',

  // POAP
  6033: 'POAP minting is not enabled for this event.',
  6034: 'A POAP has already been minted for this ticket.',

  // Whitelist
  6035: 'This event requires a whitelist entry to purchase.',
  6036: 'Whitelist entry belongs to a different event.',
  6037: 'You are not on the whitelist for this event.',
  6038: 'Your whitelist allocation is fully used.',
  6039: 'Whitelist gating is not enabled for this event.',

  // Operators
  6040: 'You are not the event authority.',
  6041: 'You are not an authorised gate operator.',
  6042: 'This gate operator is already registered.',
  6043: 'Gate operator not found.',
  6044: 'Maximum gate operators reached (10).',

  // Withdraw
  6045: 'No withdrawable balance in the event account.',
  6046: 'Requested withdrawal exceeds available balance.',

  // Refund
  6047: 'Event must be cancelled before refunding tickets.',
  6048: 'This ticket has already been refunded.',

  // General
  6049: 'Arithmetic overflow or underflow.',
}

/**
 * Extract a user-friendly message from a Solana transaction error.
 * Handles Anchor custom program errors, wallet rejections, and common failures.
 */
export function parseTransactionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)

  // 1. Anchor custom program error (hex)
  const hexMatch = msg.match(/custom program error: 0x([0-9a-fA-F]+)/)
  if (hexMatch) {
    const code = parseInt(hexMatch[1], 16)
    return PROGRAM_ERRORS[code] ?? `Transaction failed (program error ${code}).`
  }

  // 2. Anchor error name in logs  —  "Error Code: TierSaleNotStarted"
  const nameMatch = msg.match(/Error Code:\s*(\w+)\.\s*Error Number:\s*(\d+)\.\s*Error Message:\s*([^"]+?)\.?(?:"|$)/)
  if (nameMatch) {
    const code = parseInt(nameMatch[2], 10)
    return PROGRAM_ERRORS[code] ?? nameMatch[3].trim()
  }

  // 3. User rejected
  if (msg.includes('User rejected') || msg.includes('user rejected')) {
    return 'Transaction was cancelled by the wallet.'
  }

  // 4. Insufficient funds
  if (msg.includes('Insufficient funds') || msg.includes('insufficient lamports') || msg.includes('0x1')) {
    return 'Insufficient SOL balance to complete this transaction.'
  }

  // 5. Blockhash expired
  if (msg.includes('block height exceeded') || msg.includes('Blockhash not found')) {
    return 'Transaction expired. Please try again.'
  }

  // 6. Network / timeout
  if (msg.includes('Network request failed') || msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
    return 'Network error — please check your connection and try again.'
  }

  // Fallback: return a cleaned-up version (strip noisy log arrays)
  const cleanMsg = msg
    .replace(/Simulation failed\. Message: /, '')
    .replace(/Transaction simulation failed: /, '')
    .replace(/\. Logs: \[.*$/, '')
    .trim()

  return cleanMsg || 'Transaction failed. Please try again.'
}
