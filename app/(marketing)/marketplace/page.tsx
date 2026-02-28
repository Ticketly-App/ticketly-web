'use client'

import { Suspense, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useTicketlyListings } from '@/hooks/use-ticketly-marketplace'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { fetchEventAccount, fetchTicketAccount, lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { buyTicketInstruction } from '@/lib/ticketly/instructions'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

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
  const [selectedEvent, setSelectedEvent] = useState<string>(eventFilter || '')

  // Build event name lookup (exclude cancelled & ended events)
  const nowSec = BigInt(Math.floor(Date.now() / 1000))
  const hiddenEventKeys = new Set(events.filter((e) => e.isCancelled || e.eventEnd <= nowSec).map((e) => e.publicKey))
  const eventMap = new Map(events.filter((e) => !e.isCancelled && e.eventEnd > nowSec).map((e) => [e.publicKey, e]))

  const filteredListings = (selectedEvent
    ? listings.filter((l) => l.eventKey === selectedEvent)
    : listings
  ).filter((l) => !hiddenEventKeys.has(l.eventKey))

  // Get unique event keys from listings (exclude cancelled & ended events)
  const eventKeys = [...new Set(listings.map((l) => l.eventKey))].filter((k) => !hiddenEventKeys.has(k))

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
      toast.error('Failed to buy ticket.', { description: err instanceof Error ? err.message : String(err) })
    } finally {
      setBuyingListing(null)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
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
              <p className="font-display text-2xl text-white">{listings.length}</p>
              <p className="text-xs text-white/40">Active Listings</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="font-display text-2xl text-brand-400">
                {listings.length > 0
                  ? `${Math.min(...listings.map((l) => l.priceSol)).toFixed(3)} SOL`
                  : '—'}
              </p>
              <p className="text-xs text-white/40">Floor Price</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="font-display text-2xl text-white">{eventKeys.length}</p>
              <p className="text-xs text-white/40">Events Listed</p>
            </div>
          </div>

          {/* Event Filter */}
          {eventKeys.length > 0 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedEvent('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  !selectedEvent
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'glass border border-white/08 text-white/50 hover:text-white'
                }`}
              >
                All Events
              </button>
              {eventKeys.map((key) => {
                const ev = eventMap.get(key)
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedEvent(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedEvent === key
                        ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                        : 'glass border border-white/08 text-white/50 hover:text-white'
                    }`}
                  >
                    {ev?.name || `${key.slice(0, 8)}...`}
                  </button>
                )
              })}
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
                {selectedEvent ? 'No listings for this event.' : 'No active listings. Once tickets are listed for resale, they will appear here.'}
              </p>
            </div>
          )}

          {/* Listings Grid */}
          {!isLoading && filteredListings.length > 0 && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => {
                const ev = eventMap.get(listing.eventKey)
                const isMine = publicKey?.toBase58() === listing.seller
                return (
                  <div key={listing.id} className="glass-strong rounded-xl p-5 neon-border space-y-4 hover:bg-white/03 transition-colors">
                    {/* Event info */}
                    <div>
                      <p className="font-display text-white truncate">
                        {ev?.name || 'Unknown Event'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">{ev?.venue || ''}</p>
                    </div>

                    {/* Ticket info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase">Ticket</p>
                        <p className="text-xs font-mono text-white/60">{listing.ticketKey.slice(0, 12)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase">Price</p>
                        <p className="font-display text-lg text-brand-400">
                          {listing.priceSol.toFixed(4)} SOL
                        </p>
                      </div>
                    </div>

                    {/* Seller */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/30">Seller: {listing.seller.slice(0, 8)}...{listing.seller.slice(-4)}</span>
                      {isMine && <span className="badge text-[10px] bg-brand-600/20 text-brand-400 border-brand-600/30">Your listing</span>}
                    </div>

                    {/* Buy button */}
                    <button
                      onClick={() => handleBuy(listing)}
                      disabled={buyingListing === listing.id || isMine || !publicKey}
                      className="btn-primary w-full py-2.5 text-sm disabled:opacity-40"
                    >
                      {buyingListing === listing.id
                        ? 'Processing...'
                        : isMine
                        ? 'Your Listing'
                        : !publicKey
                        ? 'Connect Wallet'
                        : 'Buy Ticket'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
