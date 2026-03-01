# Ticketly - On-Chain Event Ticketing on Solana

<p align="center">
  <img src="public/android-chrome-512x512.png" width="120" alt="Ticketly Logo" />
</p>

<p align="center">
  <strong>Mint, verify, and trade event tickets as NFTs on Solana.</strong><br/>
  Zero fraud · Instant check-in · Programmable royalties
</p>

<p align="center">
  <a href="https://ticketly.tech">Live App</a> ·
  <a href="https://explorer.solana.com/address/GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs?cluster=devnet">Program on SolExplorer</a>
</p>

---

## Overview

Ticketly is a full-stack decentralized event ticketing platform built on **Solana**. Every ticket is a **compressed NFT** with on-chain metadata, enabling trustless ownership, peer-to-peer resale with enforced royalty caps, and QR-based gate check-in - all without centralized intermediaries.

## Features

### For Attendees
- **Browse & Discover** - Explore upcoming events with rich detail pages
- **Buy Tickets** - Purchase NFT tickets directly with SOL via wallet
- **QR Check-In** - Present a QR code at the gate for instant on-chain verification
- **Resale Marketplace** - List owned tickets for resale at fair, capped prices
- **POAP Collection** - Claim proof-of-attendance NFTs after events
- **Ticket Portfolio** - View all owned tickets in one place

### For Organizers
- **Create Events** - Multi-tier pricing, GPS coordinates, date ranges, custom metadata
- **Organizer Dashboard** - Revenue analytics, ticket sales charts, attendee stats
- **Whitelist Gating** - Restrict ticket access to approved wallets with allocations
- **Gate Operators** - Delegate check-in authority to up to 10 operator wallets per event
- **Revenue Withdrawal** - Withdraw accumulated SOL from primary sales on-chain
- **Event Management** - Update, cancel events; manage operators & whitelists

### Platform
- **On-Chain Program** - Anchor-based Solana program with full instruction set
- **Protocol Fees** - Configurable platform-wide fee (basis points)
- **Metaplex Integration** - NFT metadata via Token Metadata program
- **Dark Theme UI** - Glassmorphism design with responsive layout

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Solana (Devnet) · Anchor Framework |
| **Frontend** | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| **Styling** | Tailwind CSS 4 · Radix UI · Lucide Icons |
| **Wallet** | Solana Wallet Adapter (Phantom, Solflare, etc.) |
| **NFT** | Metaplex Token Metadata · SPL Token |
| **Database** | MongoDB (event metadata cache) |
| **Media** | Cloudinary (event images) |
| **Charts** | Recharts |
| **State** | Jotai · Zustand · TanStack React Query |
| **Analytics** | Vercel Analytics |
| **Deployment** | Vercel |

## Project Structure

```
ticketly-web/
├── app/                        # Next.js App Router pages
│   ├── (dashboard)/            # Organizer dashboard (events, revenue, profile)
│   ├── (marketing)/            # Public pages (events, marketplace)
│   ├── (user)/                 # User pages (my tickets)
│   ├── api/                    # REST API routes
│   │   ├── events/             # CRUD events
│   │   ├── tickets/            # Ticket queries
│   │   ├── marketplace/        # Resale listings
│   │   ├── metadata/           # NFT metadata & images (JSON, SVG, PNG)
│   │   ├── stats/              # On-chain platform stats
│   │   ├── organizer/          # Organizer profiles
│   │   └── analytics/          # Event analytics
│   ├── account/                # Wallet account page
│   ├── gate/                   # QR scanner for gate operators
│   └── layout.tsx              # Root layout with metadata & providers
├── src/
│   ├── components/             # UI components
│   │   ├── dashboard/          # Dashboard views (revenue charts, event cards)
│   │   ├── event/              # Event detail & listing components
│   │   ├── ticket/             # Ticket card, QR display
│   │   ├── landing/            # Hero, features, stats sections
│   │   ├── layout/             # Header, footer, sidebar
│   │   ├── solana/             # Wallet connection UI
│   │   └── ui/                 # Shared primitives (button, card, dialog, etc.)
│   ├── lib/
│   │   ├── db/                 # MongoDB models & connection
│   │   ├── solana/             # Anchor client helpers
│   │   ├── ticketly/           # Program interaction utilities
│   │   ├── pda.ts              # PDA derivation helpers
│   │   └── idl.ts              # Program IDL
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── anchor/src/                 # Anchor IDL & generated types
├── public/                     # Static assets (favicons, OG image, logos)
└── package.json
```

## Solana Program

**Program ID:** `GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs`

The on-chain program (in `../ticketly/`) exposes the following instructions:

| Instruction | Description |
|-------------|-------------|
| `init_platform` | Initialize platform config with protocol fee |
| `update_platform` | Update fee rate, receiver, or pause creation |
| `init_organizer` | Create organizer profile (name, website, logo) |
| `update_organizer` | Update organizer profile details |
| `create_event` | Create event with tiers, dates, venue, GPS, POAP config |
| `update_event` | Modify event details before it starts |
| `cancel_event` | Cancel event (only if no check-ins yet) |
| `mint_ticket` | Mint an NFT ticket to an attendee |
| `check_in_ticket` | Verify & check in a ticket at the gate |
| `transfer_ticket` | Peer-to-peer ticket gift/transfer |
| `mint_poap` | Mint proof-of-attendance NFT |
| `list_ticket` | List a ticket for resale on marketplace |
| `buy_ticket` | Purchase a listed resale ticket |
| `cancel_listing` | Cancel a resale listing |
| `add_operator` | Add a gate operator wallet (max 10/event) |
| `remove_operator` | Revoke a gate operator |
| `add_whitelist_entry` | Add wallet to event whitelist |
| `remove_whitelist_entry` | Remove wallet from whitelist |
| `withdraw_revenue` | Withdraw SOL from event sales |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm**
- **Solana CLI** (for program deployment)
- **Anchor CLI** (for building the program)
- A Solana wallet (Phantom, Solflare, etc.)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Ticketly.git
cd Ticketly/ticketly-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the `ticketly-web` directory:

```env
# Required
NEXT_PUBLIC_PROGRAM_ID=GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
MONGODB_URI=your_mongodb_connection_string

# Media uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Optional
NEXT_PUBLIC_APP_URL=https://ticketly.tech
NEXTAUTH_SECRET=your_secret
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET | List all events |
| `/api/events/[id]` | GET | Get event details |
| `/api/events/[id]/operator` | POST | Manage gate operators |
| `/api/events/[id]/whitelist` | POST | Manage whitelist |
| `/api/tickets` | GET | List tickets |
| `/api/tickets/[id]` | GET | Get ticket details |
| `/api/marketplace` | GET | List marketplace listings |
| `/api/stats` | GET | Platform-wide on-chain stats |
| `/api/organizer` | GET | Organizer profiles |
| `/api/analytics` | GET | Event analytics data |
| `/api/metadata/ticket/[event]/[ticket]` | GET | NFT metadata JSON |
| `/api/metadata/ticket/[event]/[ticket]/image.svg` | GET | Ticket image (SVG) |
| `/api/metadata/ticket/[event]/[ticket]/image.png` | GET | Ticket image (PNG) |

## Deployment

The app is deployed on **Vercel** at [ticketly.tech](https://ticketly.tech).

```bash
# Deploy via Vercel CLI
npx vercel --prod
```

Ensure all environment variables are configured in your Vercel project settings.


---

Build with ❤️ for solana