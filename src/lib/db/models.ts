import mongoose, { Schema, Document } from "mongoose";

// Event Model (mirrors on-chain data + extra metadata)
export interface IEvent extends Document {
  pubkey: string;
  organizer: string;
  organizerWallet: string;
  eventId: number;
  name: string;
  description: string;
  imageUri: string;
  startTime: Date;
  endTime: Date;
  venue: string;
  location?: { lat: number; lng: number };
  categories: string[];
  tiers: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    supply: number;
    sold: number;
    tierType: string;
    transferable: boolean;
    maxPerWallet: number;
  }>;
  totalTicketsSold: number;
  totalRevenue: number;
  totalCheckins: number;
  whitelistEnabled: boolean;
  poapEnabled: boolean;
  resaleEnabled: boolean;
  maxResalePercent: number;
  status: "Active" | "Cancelled" | "Completed" | "Paused";
  featuredUntil?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  pubkey: { type: String, required: true, unique: true, index: true },
  organizer: { type: String, required: true, index: true },
  organizerWallet: { type: String, required: true, index: true },
  eventId: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUri: { type: String, default: "" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  venue: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
  },
  categories: [String],
  tiers: [{
    id: Number,
    name: String,
    description: String,
    price: Number,
    supply: Number,
    sold: Number,
    tierType: String,
    transferable: Boolean,
    maxPerWallet: Number,
  }],
  totalTicketsSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalCheckins: { type: Number, default: 0 },
  whitelistEnabled: { type: Boolean, default: false },
  poapEnabled: { type: Boolean, default: false },
  resaleEnabled: { type: Boolean, default: false },
  maxResalePercent: { type: Number, default: 0 },
  status: { type: String, enum: ["Active", "Cancelled", "Completed", "Paused"], default: "Active" },
  featuredUntil: Date,
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

EventSchema.index({ name: "text", description: "text", venue: "text" });
EventSchema.index({ categories: 1 });
EventSchema.index({ startTime: 1 });
EventSchema.index({ status: 1 });

// Ticket Model
export interface ITicket extends Document {
  pubkey: string;
  event: string;
  eventPubkey: string;
  owner: string;
  tierId: number;
  tierName: string;
  ticketIndex: number;
  purchasePrice: number;
  purchasedAt: Date;
  isUsed: boolean;
  isListed: boolean;
  poapMinted: boolean;
  checkedInAt?: Date;
  txSignature: string;
}

const TicketSchema = new Schema<ITicket>({
  pubkey: { type: String, required: true, unique: true, index: true },
  event: { type: String, required: true, index: true },
  eventPubkey: { type: String, required: true, index: true },
  owner: { type: String, required: true, index: true },
  tierId: Number,
  tierName: String,
  ticketIndex: Number,
  purchasePrice: Number,
  purchasedAt: Date,
  isUsed: { type: Boolean, default: false },
  isListed: { type: Boolean, default: false },
  poapMinted: { type: Boolean, default: false },
  checkedInAt: Date,
  txSignature: String,
}, { timestamps: true });

// Organizer Model
export interface IOrganizer extends Document {
  pubkey: string;
  authority: string;
  name: string;
  description: string;
  imageUri: string;
  website?: string;
  twitter?: string;
  totalEvents: number;
  totalRevenue: number;
  verified: boolean;
}

const OrganizerSchema = new Schema<IOrganizer>({
  pubkey: { type: String, required: true, unique: true, index: true },
  authority: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: String,
  imageUri: String,
  website: String,
  twitter: String,
  totalEvents: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

// Listing Model
export interface IListing extends Document {
  pubkey: string;
  ticket: string;
  ticketPubkey: string;
  event: string;
  eventPubkey: string;
  seller: string;
  price: number;
  tierName: string;
  eventName: string;
  eventImageUri: string;
  isActive: boolean;
  listedAt: Date;
}

const ListingSchema = new Schema<IListing>({
  pubkey: { type: String, required: true, unique: true, index: true },
  ticket: { type: String, required: true, index: true },
  ticketPubkey: { type: String, required: true, index: true },
  event: { type: String, required: true, index: true },
  eventPubkey: { type: String, required: true, index: true },
  seller: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  tierName: String,
  eventName: String,
  eventImageUri: String,
  isActive: { type: Boolean, default: true, index: true },
  listedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Analytics Event Model
export interface IAnalyticsEvent extends Document {
  type: "ticket_mint" | "ticket_checkin" | "ticket_transfer" | "listing_created" | "ticket_sold" | "poap_minted";
  eventPubkey: string;
  ticketPubkey?: string;
  wallet: string;
  amount?: number;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  type: String,
  eventPubkey: { type: String, index: true },
  ticketPubkey: String,
  wallet: String,
  amount: Number,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
});

export const EventModel = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export const TicketModel = mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);
export const OrganizerModel = mongoose.models.Organizer || mongoose.model<IOrganizer>("Organizer", OrganizerSchema);
export const ListingModel = mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);
export const AnalyticsEventModel = mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);