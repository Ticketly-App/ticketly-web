'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useTicketlyEvent, mapTicketTier } from '@/hooks/use-ticketly-events'
import { mintTicketInstruction } from '@/lib/ticketly/instructions'
import { findTicketAddress } from '@/lib/ticketly/pdas'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { useQueryClient } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

const TIER_NAMES: Record<string, string> = {
  '0': 'General Admission',
  '1': 'Early Bird',
  '2': 'VIP',
  '3': 'VVIP',
  '4': 'Custom',
}

export function EventDetail({ eventKey }: { eventKey: string }) {
  const queryClient = useQueryClient()
  const { data: event, isLoading: eventLoading } = useTicketlyEvent(eventKey)
  const [selectedTier, setSelectedTier] = useState(0)
  const [isMinting, setIsMinting] = useState(false)
  const router = useRouter()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="pt-28 pb-20 px-6">
          <div className="max-w-6xl mx-auto animate-pulse space-y-6">
            <div className="h-64 rounded-2xl bg-white/5" />
            <div className="h-8 w-64 rounded bg-white/5" />
            <div className="h-4 w-96 rounded bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <div className="pt-28 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="glass rounded-2xl p-12">
              <p className="text-white/50 text-lg">Event not found on devnet.</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const tiers = event.ticketTiers.map(mapTicketTier)
  const activeTier = tiers[selectedTier] || tiers[0]
  const eventStart = new Date(Number(event.eventStart) * 1000)
  const eventEnd = new Date(Number(event.eventEnd) * 1000)

  const handleMint = async () => {
    if (!publicKey || (!sendTransaction && !signTransaction)) {
      toast.error('Connect a wallet to buy tickets.')
      return
    }
    if (!activeTier || activeTier.soldOut) {
      toast.error('This tier is sold out.')
      return
    }
    if (event.isCancelled) {
      toast.error('This event has been cancelled.')
      return
    }

    setIsMinting(true)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')
      const eventAuthority = new PublicKey(event.authority)
      const eventId = BigInt(event.id)
      const eventPubkey = new PublicKey(event.publicKey)
      const ticketNumber = BigInt(Number(event.totalMinted))
      const metadataUri = `https://ticketly.dev/metadata/ticket/${event.publicKey}/${ticketNumber.toString()}`

      const ix = mintTicketInstruction(
        eventAuthority,
        eventId,
        publicKey,
        publicKey,
        ticketNumber,
        { tierIndex: selectedTier, metadataUri },
        TOKEN_METADATA_PROGRAM,
        event.whitelistGated,
      )

      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      const latestBlockhash = await connection.getLatestBlockhash()
      tx.recentBlockhash = latestBlockhash.blockhash

      let signature: string
      if (signTransaction) {
        const signedTx = await signTransaction(tx)
        signature = await connection.sendRawTransaction(signedTx.serialize(), {
          preflightCommitment: 'confirmed',
          skipPreflight: false,
          maxRetries: 3,
        })
      } else if (sendTransaction) {
        signature = await sendTransaction(tx, connection)
      } else {
        throw new Error('Wallet does not support transaction submission.')
      }

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

      const [ticketPda] = findTicketAddress(eventPubkey, ticketNumber)
      // Sync ticket to MongoDB
      try {
        await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pubkey: ticketPda.toBase58(),
            event: event.publicKey,
            eventPubkey: event.publicKey,
            owner: publicKey.toBase58(),
            tierId: selectedTier,
            tierName: TIER_NAMES[activeTier.tierType] || `Tier ${selectedTier}`,
            ticketIndex: Number(ticketNumber),
            purchasePrice: Number(activeTier.price),
            txSignature: signature,
          }),
        })
      } catch (dbErr) {
        console.error('Failed to persist ticket to MongoDB', dbErr)
      }

      toast.success('Ticket minted on devnet!', { description: sigDescription(signature) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-events'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-event'] })
    } catch (error) {
      console.error(error)
      toast.error('Failed to mint ticket.', {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <span className={`badge ${event.isCancelled ? 'bg-red-500/20 text-red-400 border-red-500/30' : event.isActive ? 'badge-active' : 'bg-white/10 text-white/50 border-white/10'}`}>
              {event.isCancelled ? 'Cancelled' : event.isActive ? 'On Sale' : 'Draft'}
            </span>
            {event.poapEnabled && <span className="badge badge-vip">POAP</span>}
            {event.resaleAllowed && <span className="badge bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Resale</span>}
            {event.whitelistGated && <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30">Whitelist</span>}
          </div>
          <h1 className="heading-display text-4xl md:text-6xl text-white mb-4">{event.name}</h1>
          <p className="text-white/40 text-lg max-w-2xl mb-8">{event.description}</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {eventStart.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {eventStart.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} – {eventEnd.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {event.venue}
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Tiers */}
          <div className="space-y-6">
            <h2 className="font-display text-xl text-white">Select Ticket Tier</h2>
            <div className="space-y-3">
              {tiers.map((tier, i) => {
                const tierName = TIER_NAMES[tier.tierType] || `Tier ${i}`
                const percent = tier.supply > 0 ? (tier.minted / tier.supply) * 100 : 0
                const isSelected = selectedTier === i
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedTier(i)}
                    className={`w-full text-left ticket-card p-5 transition-all ${isSelected ? 'neon-border bg-brand-600/5' : 'hover:bg-white/02'} ${tier.soldOut ? 'opacity-50' : ''}`}
                    disabled={tier.soldOut}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand-400' : 'border-white/20'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-brand-400" />}
                        </div>
                        <span className="font-display text-white">{tierName}</span>
                        {tier.soldOut && <span className="badge bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">Sold Out</span>}
                      </div>
                      <span className="font-display text-brand-400">
                        {tier.priceSol === 0 ? 'FREE' : `${tier.priceSol.toFixed(4)} SOL`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>{tier.minted}/{tier.supply} minted</span>
                      <span>{tier.available} remaining</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/05 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Stats */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-white mb-4">Event Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Minted', value: Number(event.totalMinted).toString() },
                  { label: 'Checked In', value: Number(event.totalCheckedIn).toString() },
                  { label: 'Revenue', value: `${lamportsToSol(Number(event.totalRevenue)).toFixed(4)} SOL`, accent: true },
                  { label: 'Royalty', value: `${event.royaltyBps / 100}%` },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`font-display text-lg ${s.accent ? 'text-brand-400' : 'text-white'}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="glass-strong rounded-2xl p-6 neon-border space-y-5">
              <div>
                <h3 className="font-display text-lg text-white">Buy Ticket</h3>
                <p className="text-xs text-white/40 mt-1">Mint an NFT ticket directly to your wallet on Solana devnet.</p>
              </div>
              {activeTier && (
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between"><span className="text-sm text-white/60">Tier</span><span className="text-sm font-medium text-white">{TIER_NAMES[activeTier.tierType] || `Tier ${selectedTier}`}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-white/60">Price</span><span className="font-display text-brand-400">{activeTier.priceSol === 0 ? 'FREE' : `${activeTier.priceSol.toFixed(4)} SOL`}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-white/60">Available</span><span className="text-sm text-white">{activeTier.available} / {activeTier.supply}</span></div>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-white/08">
                <span className="text-sm text-white/60">Total</span>
                <span className="font-display text-xl text-white">{activeTier ? (activeTier.priceSol === 0 ? 'FREE' : `${activeTier.priceSol.toFixed(4)} SOL`) : '—'}</span>
              </div>
              <button onClick={handleMint} disabled={isMinting || !activeTier || activeTier.soldOut || event.isCancelled || !publicKey} className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed">
                {isMinting ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Minting...</span>) : !publicKey ? 'Connect Wallet' : activeTier?.soldOut ? 'Sold Out' : event.isCancelled ? 'Event Cancelled' : 'Mint Ticket'}
              </button>
              <p className="text-[11px] text-white/30 text-center">Transaction is signed and confirmed on Solana devnet.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
