import { TICKETLY_IDL } from './idl-raw'

export { TICKETLY_IDL }
export type TicketlyIdl = typeof TICKETLY_IDL

function getInstructionDiscriminator(names: string[]): Uint8Array {
  const instructions = (
    TICKETLY_IDL as {
      instructions?: ReadonlyArray<{ name: string; discriminator: ReadonlyArray<number> }>
    }
  ).instructions ?? []
  for (const name of names) {
    const match = instructions.find((instruction) => instruction.name === name)
    if (match) {
      return new Uint8Array(match.discriminator)
    }
  }
  return new Uint8Array(8)
}

export const INSTRUCTION_DISCRIMINATORS = {
  // Event lifecycle
  CreateEvent: getInstructionDiscriminator(['create_event']),
  UpdateEvent: getInstructionDiscriminator(['update_event']),
  CancelEvent: getInstructionDiscriminator(['cancel_event']),

  // Organizer
  InitOrganizer: getInstructionDiscriminator(['init_organizer']),
  UpdateOrganizer: getInstructionDiscriminator(['update_organizer']),

  // Platform
  InitPlatform: getInstructionDiscriminator(['init_platform']),
  UpdatePlatform: getInstructionDiscriminator(['update_platform']),

  // Tickets
  MintTicket: getInstructionDiscriminator(['mint_ticket']),
  CheckInTicket: getInstructionDiscriminator(['check_in_ticket']),
  TransferTicket: getInstructionDiscriminator(['transfer_ticket']),

  // Marketplace
  ListTicket: getInstructionDiscriminator(['list_ticket']),
  BuyTicket: getInstructionDiscriminator(['buy_ticket']),
  CancelListing: getInstructionDiscriminator(['cancel_listing']),

  // Access control
  AddOperator: getInstructionDiscriminator(['add_operator']),
  RemoveOperator: getInstructionDiscriminator(['remove_operator']),
  AddWhitelistEntry: getInstructionDiscriminator(['add_whitelist_entry']),
  RemoveWhitelistEntry: getInstructionDiscriminator(['remove_whitelist_entry']),

  // Revenue & POAP
  WithdrawRevenue: getInstructionDiscriminator(['withdraw_revenue']),
  MintPoap: getInstructionDiscriminator(['mint_poap']),
} as const

export const ACCOUNT_DISCRIMINATORS = {
  EventAccount: new Uint8Array([98, 136, 32, 165, 133, 231, 243, 154]),
  ListingAccount: new Uint8Array([59, 89, 136, 25, 21, 196, 183, 13]),
  OrganizerProfile: new Uint8Array([216, 88, 24, 216, 45, 218, 209, 79]),
  PlatformConfig: new Uint8Array([160, 78, 128, 0, 248, 83, 230, 160]),
  PoapRecord: new Uint8Array([44, 75, 50, 216, 240, 99, 62, 107]),
  TicketAccount: new Uint8Array([231, 93, 13, 18, 239, 66, 21, 45]),
  WhitelistEntry: new Uint8Array([51, 70, 173, 81, 219, 192, 234, 62]),
} as const

