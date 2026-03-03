'use client'

import { Suspense, useState, useMemo } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { XAuthGate } from '@/components/auth/XAuthGate'
import { Footer } from '@/components/layout/Footer'
import { useTicketlyListings } from '@/hooks/use-ticketly-marketplace'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
import { useOrganizerProfiles } from '@/hooks/use-organizer-profiles'
import { useSellerProfiles } from '@/hooks/use-seller-profiles'
import { OrganizerProfilePopup } from '@/components/organizer/OrganizerProfilePopup'
import { GradientAvatar } from '@/components/ui/gradient-avatar'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { fetchEventAccount, fetchTicketAccount, lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { buyTicketInstruction } from '@/lib/ticketly/instructions'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { parseTransactionError } from '@/lib/parse-transaction-error'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { GeneratedBanner } from '@/components/ui/GeneratedBanner'
import { MapPin, Tag, ShoppingCart, XCircle } from 'lucide-react'
import { format } from 'date-fns'

// OrganizerAvatar: shows image, falls back to GradientAvatar on error
function OrganizerAvatar({ logoUri, authority, name, size = 32, className = '' }: { logoUri?: string, authority?: string, name?: string, size?: number, className?: string }) {
  const [error, setError] = useState(false)
  if (error || !logoUri) {
    return <GradientAvatar seed={(authority ?? '') || (name ?? '')} name={name ?? ''} size={size} className={className} />
  }
  return (
    <img
      src={logoUri}
      alt={name}
      className={`rounded-full object-cover ring-1 ring-white/10 ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  )
}

export default function MarketplacePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950"><Navbar /><div className="pt-28 pb-20 px-6"><div className="max-w-7xl mx-auto animate-pulse"><div className="h-12 w-64 bg-white/5 rounded mb-8" /><div className="grid gap-4 grid-cols-3 mb-8">{[1,2,3].map(i=><div key={i} className="glass rounded-xl p-4 h-20" />)}</div></div></div></div>}>
      <MarketplacePage />
    </Suspense>
  )
}

function MarketplacePage() {
  const queryClient = useQueryClient()
  const { data: listings = [], isLoading } = useTicketlyListings()
  const { data: events = [] } = useTicketlyEvents()
  const searchParams = useSearchParams()
  const eventFilter = searchParams.get('event')
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const [buyingListing, setBuyingListing] = useState<string | null>(null)
  const [orgPopup, setOrgPopup] = useState<{ authority: string } | null>(null)

  // Fetch organizer profiles for all event authorities
  const eventAuthorities = useMemo(() => events.map((e) => e.authority), [events])
  const { data: organizerProfiles } = useOrganizerProfiles(eventAuthorities)

  // Fetch seller profiles (Twitter handles from wallet bindings)
  const sellerWallets = useMemo(() => listings.map((l) => l.seller), [listings])
  const { data: sellerProfiles } = useSellerProfiles(sellerWallets)

  // Build event lookup — completely hide expired/cancelled events from marketplace
  const nowSec = BigInt(Math.floor(Date.now() / 1000))
  const expiredEventKeys = new Set(events.filter((e) => e.isCancelled || e.eventEnd <= nowSec).map((e) => e.publicKey))
  const eventMap = new Map(events.map((e) => [e.publicKey, e]))
  const myWallet = publicKey?.toBase58() || ''

  // Category filter — derive from event symbol (which stores the category uppercase)
  const CATEGORY_LABELS: Record<string, string> = {
    MUSIC: 'Music', SPORTS: 'Sports', CONFERENCE: 'Conference', THEATRE: 'Theatre',
    ART: 'Art', GAMING: 'Gaming', FOOD: 'Food', OTHER: 'Other', TICKET: 'Other', TKT: 'Other',
  }
  const [selectedCategory, setSelectedCategory] = useState<string>(eventFilter || '')

  // Unique categories from active listings
  const categorySet = useMemo(() => {
    const cats = new Set<string>()
    listings.forEach((l) => {
      if (expiredEventKeys.has(l.eventKey)) return
      const ev = eventMap.get(l.eventKey)
      if (ev) cats.add(ev.symbol.toUpperCase())
    })
    return cats
  }, [listings, events])

  const categories = useMemo(() =>
    [...categorySet].sort().map((sym) => ({
      key: sym,
      label: CATEGORY_LABELS[sym] || sym.charAt(0) + sym.slice(1).toLowerCase(),
    })),
  [categorySet])

  const filteredListings = listings.filter((l) => {
    // Completely hide listings for expired/cancelled events
    if (expiredEventKeys.has(l.eventKey)) return false
    // Category filter
    if (selectedCategory) {
      const ev = eventMap.get(l.eventKey)
      if (!ev || ev.symbol.toUpperCase() !== selectedCategory) return false
    }
    return true
  })

  // Count for stats
  const activeEventKeys = [...new Set(listings.map((l) => l.eventKey))].filter((k) => !expiredEventKeys.has(k))

  async function handleBuy(listing: (typeof listings)[number]) {
    if (!publicKey || (!sendTransaction && !signTransaction)) {
      toast.error('Connect a wallet to buy tickets.')
      return
    }
    setBuyingListing(listing.id)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')
      const [eventAccount, ticketAccount] = await Promise.all([
        fetchEventAccount(cluster.endpoint, listing.eventKey),
        fetchTicketAccount(cluster.endpoint, listing.ticketKey),
      ])
      if (!eventAccount || !ticketAccount) throw new Error('Missing event or ticket account.')

      const ix = buyTicketInstruction({
        event: new PublicKey(listing.eventKey),
        ticket: new PublicKey(listing.ticketKey),
        listing: new PublicKey(listing.publicKey),
        mint: ticketAccount.mint,
        seller: new PublicKey(listing.seller),
        royaltyReceiver: eventAccount.royaltyReceiver,
        buyer: publicKey,
      })

      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      const latestBlockhash = await connection.getLatestBlockhash()
      tx.recentBlockhash = latestBlockhash.blockhash

      let signature: string
      if (signTransaction) {
        const signedTx = await signTransaction(tx)
        signature = await connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: 'confirmed', skipPreflight: false, maxRetries: 3 })
      } else if (sendTransaction) {
        signature = await sendTransaction(tx, connection)
      } else {
        throw new Error('Wallet does not support transactions.')
      }

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      toast.success('Ticket purchased!', { description: sigDescription(signature) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-events'] })
    } catch (err) {
      console.error(err)
      toast.error('Failed to buy ticket.', { description: parseTransactionError(err) })
    } finally {
      setBuyingListing(null)
    }
  }

  return (
    <XAuthGate message="Verify your X (Twitter) account to access the Ticketly marketplace and trade tickets.">
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="badge badge-active mb-4">Secondary Market</div>
            <h1 className="heading-display text-5xl text-white mb-3">
              <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="text-white/40">Buy and sell tickets on the secondary market. All trades are settled on-chain.</p>
          </div>

          {/* Stats Bar */}
          <div className="grid gap-4 grid-cols-3 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <p className="font-display text-2xl text-white">{filteredListings.length}</p>
              <p className="text-xs text-white/40">Active Listings</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="font-display text-2xl text-brand-400">
                {filteredListings.length > 0
                  ? `${Math.min(...filteredListings.map((l) => l.priceSol)).toFixed(3)} SOL`
                  : '—'}
              </p>
              <p className="text-xs text-white/40">Floor Price</p>
            </div>
            <div className="glass   rounded-xl p-4 text-center">
              <p className="font-display text-2xl text-white">{activeEventKeys.length}</p>
              <p className="text-xs text-white/40">Events Listed</p>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'glass border border-white/08 text-white/50 hover:text-white'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                      : 'glass border border-white/08 text-white/50 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-5 animate-pulse space-y-3">
                  <div className="h-5 w-32 bg-white/5 rounded" />
                  <div className="h-4 w-24 bg-white/5 rounded" />
                  <div className="h-9 w-full bg-white/5 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && filteredListings.length === 0 && (
            <div className="glass rounded-2xl p-16 text-center">
              <p className="text-4xl mb-4 opacity-50">🏪</p>
              <p className="text-white/50 text-sm">
                {selectedCategory ? 'No listings in this category.' : 'No active listings. Once tickets are listed for resale, they will appear here.'}
              </p>
            </div>
          )}

          {/* Listings */}
          {!isLoading && filteredListings.length > 0 && (
            <div className="space-y-3 max-w-3xl">
              {filteredListings.map((listing) => {
                const ev = eventMap.get(listing.eventKey)
                const isMine = publicKey?.toBase58() === listing.seller
                const eventName = ev?.name || 'Unknown Event'
                const venue = ev?.venue || ''
                const eventStart = ev ? new Date(Number(ev.eventStart) * 1000) : null
                const imageUri = ev?.metadataUri || ''
                const hasRealImage = imageUri && !imageUri.includes('ticketly.dev/metadata')

                // Organizer profile
                const orgProfile = ev ? organizerProfiles?.get(ev.authority) : null
                const orgHandle = orgProfile?.username || null
                const orgName = orgProfile?.name || (ev?.authority ? `${ev.authority.slice(0, 4)}...${ev.authority.slice(-4)}` : '—')
                const orgLogo = orgProfile?.logoUri || ''

                // Seller profile
                const sellerProfile = sellerProfiles?.get(listing.seller)
                const sellerHandle = sellerProfile?.handle || null

                return (
                  <div key={listing.id} className="ticket-card group">
                    {/* Subtle gradient shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-brand-500/[0.02] pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="relative flex flex-col sm:flex-row">
                      {/* Left content */}
                      <div className="flex-1 p-4 sm:p-5 space-y-2 min-w-0">
                        {/* Time */}
                        {eventStart && (
                          <p className="text-xs text-white/35 font-medium tracking-wide">
                            {format(eventStart, 'MMM d · h:mm a')}
                          </p>
                        )}

                        {/* Event name */}
                        <h3 className="font-display text-white text-lg sm:text-xl leading-tight truncate pr-2">{eventName}</h3>

                        {/* Location */}
                        {venue && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/35">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{venue}</span>
                          </div>
                        )}

                        {/* Org profile row */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-white/25 uppercase tracking-wider w-8 flex-shrink-0">Org</span>
                          <button
                            onClick={() => ev && setOrgPopup({ authority: ev.authority })}
                            className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-brand-400 transition-colors min-w-0"
                          >
                            <OrganizerAvatar logoUri={orgLogo} authority={ev?.authority ?? ''} name={ev?.name ?? ''} size={24} className="mr-2" />
                            <span className="truncate">{orgHandle ? `@${orgHandle}` : orgName}</span>
                          </button>
                        </div>

                        {/* Seller profile row */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/25 uppercase tracking-wider w-8 flex-shrink-0">Seller</span>
                          {sellerHandle ? (
                            <a
                              href={`https://x.com/${sellerHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-brand-400 transition-colors min-w-0"
                            >
                              <div className="w-5 h-5 rounded-full ring-1 ring-white/10 flex-shrink-0 overflow-hidden relative">
                                <GradientAvatar seed={sellerHandle} name={sellerHandle} size={20} className="absolute inset-0" />
                                <img
                                  src={`https://unavatar.io/twitter/${sellerHandle}`}
                                  alt={sellerHandle}
                                  className="w-full h-full object-cover relative z-10"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                              </div>
                              <span className="truncate">@{sellerHandle}</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-white/30">
                              <GradientAvatar seed={listing.seller} name={listing.seller} size={20} className="ring-1 ring-white/10" />
                              <span className="truncate">{listing.seller.slice(0, 4)}...{listing.seller.slice(-4)}</span>
                            </span>
                          )}
                          {isMine && (
                            <span className="text-[10px] text-brand-400 font-medium ml-1">(You)</span>
                          )}
                        </div>

                        {/* Unsold badge for expired */}
        
                      </div>

                      {/* Right image */}
                      <div className="hidden sm:flex items-center pr-5 py-4 flex-shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-dark-800 ring-1 ring-white/[0.06] shadow-lg shadow-black/30">
                          {hasRealImage ? (
                            <img src={imageUri} alt={eventName} className="w-full h-full object-cover" />
                          ) : (
                            <GeneratedBanner name={eventName} category={ev?.symbol || ''} size="sm" showInitial={true} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action bar — price capsule + buy button */}
                    <div className="relative flex items-center gap-2.5 px-4 sm:px-5 pb-4 pt-1">
                      <div className="absolute top-0 left-4 right-4 sm:left-5 sm:right-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                      {/* Price capsule */}
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
                        <Tag className="w-3.5 h-3.5" />
                        {listing.priceSol.toFixed(4)} SOL
                      </span>
                      <button
                          onClick={() => handleBuy(listing)}
                          disabled={buyingListing === listing.id || isMine || !publicKey}
                          className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 ${
                            isMine
                              ? 'bg-white/[0.04] border border-white/[0.08] text-white/40 cursor-not-allowed'
                              : 'bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {buyingListing === listing.id
                            ? 'Processing...'
                            : isMine
                              ? 'Your Listing'
                              : !publicKey
                                ? 'Connect Wallet'
                                : 'Buy Ticket'}
                        </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Organizer Profile Popup */}
          {orgPopup && (
            <OrganizerProfilePopup
              organizer={organizerProfiles?.get(orgPopup.authority) || null}
              authority={orgPopup.authority}
              allEvents={events}
              onClose={() => setOrgPopup(null)}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
    </XAuthGate>
  )
}
