'use client'

import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useTicketlyTickets, type TicketlyTicket } from '@/hooks/use-ticketly-tickets'
import { useTicketlyEvents, type TicketlyEvent } from '@/hooks/use-ticketly-events'
import {
  listTicketInstruction,
  cancelListingInstruction,
  transferTicketInstruction,
  mintPoapInstruction,
} from '@/lib/ticketly/instructions'
import { findTicketMintAddress } from '@/lib/ticketly/pdas'
import { fetchTicketAccount } from '@/lib/ticketly/ticketly-query'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { useQueryClient } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { GeneratedBanner } from '@/components/ui/GeneratedBanner'
import { MapPin, Clock, QrCode, ArrowRightLeft, Tag, X, Award } from 'lucide-react'
import { format } from 'date-fns'
import QRCode from 'qrcode'

const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

type Tab = 'upcoming' | 'past' | 'listed'

const TIER_NAMES: Record<string, string> = {
  '0': 'General Admission', '1': 'Early Bird', '2': 'VIP', '3': 'VVIP', '4': 'Custom',
}

export function MyTicketsSection() {
  const queryClient = useQueryClient()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const { data: tickets = [], isLoading, refetch } = useTicketlyTickets()
  const { data: events = [] } = useTicketlyEvents()
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [actionTicket, setActionTicket] = useState<string | null>(null)
  const [listPrice, setListPrice] = useState('')
  const [transferAddr, setTransferAddr] = useState('')
  const [showModal, setShowModal] = useState<'list' | 'transfer' | 'qr' | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketlyTicket | null>(null)
  const [processing, setProcessing] = useState(false)

  const now = Date.now() / 1000
  const filteredTickets = tickets.filter((t) => {
    const ev = events.find((e) => e.publicKey === t.eventKey)
    const eventEnd = ev ? Number(ev.eventEnd) : Infinity
    if (activeTab === 'listed') return t.isListed
    if (activeTab === 'past') return eventEnd < now && !t.isListed
    return eventEnd >= now && !t.isListed
  })

  const getEvent = (eventKey: string) => {
    return events.find((e) => e.publicKey === eventKey) || null
  }

  const sendTx = async (ix: any) => {
    if (!publicKey || (!sendTransaction && !signTransaction)) throw new Error('Wallet not connected')
    const connection = new Connection(cluster.endpoint, 'confirmed')
    const tx = new Transaction().add(ix)
    tx.feePayer = publicKey
    const latestBlockhash = await connection.getLatestBlockhash()
    tx.recentBlockhash = latestBlockhash.blockhash
    let sig: string
    if (signTransaction) {
      const signedTx = await signTransaction(tx)
      sig = await connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: 'confirmed', skipPreflight: false, maxRetries: 3 })
    } else {
      sig = await sendTransaction!(tx, connection)
    }
    await connection.confirmTransaction({ signature: sig, ...latestBlockhash }, 'confirmed')
    return sig
  }

  const handleList = async () => {
    if (!selectedTicket || !publicKey) return
    const price = parseFloat(listPrice)
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price.'); return }
    const priceLamports = BigInt(Math.floor(price * 1_000_000_000))
    const ev = events.find((e) => e.publicKey === selectedTicket.eventKey)
    if (ev?.maxResalePrice != null && priceLamports > ev.maxResalePrice) {
      toast.error(`Price exceeds the resale cap of ${lamportsToSol(Number(ev.maxResalePrice)).toFixed(4)} SOL.`)
      return
    }
    setProcessing(true)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')
      const ticketOnChain = await fetchTicketAccount(cluster.endpoint, selectedTicket.publicKey)
      if (!ticketOnChain) throw new Error('Ticket not found on-chain')
      const [mintPda] = findTicketMintAddress(new PublicKey(selectedTicket.publicKey))
      const priceLamports = BigInt(Math.floor(price * 1_000_000_000))
      const ix = listTicketInstruction(new PublicKey(selectedTicket.eventKey), new PublicKey(selectedTicket.publicKey), ticketOnChain.mint, publicKey, priceLamports)
      const sig = await sendTx(ix)
      toast.success('Ticket listed!', { description: sigDescription(sig) })
      setShowModal(null)
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-listings'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to list ticket.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setProcessing(false) }
  }

  const handleCancelListing = async (ticket: TicketlyTicket) => {
    if (!publicKey) return
    setActionTicket(ticket.publicKey)
    try {
      const ticketOnChain = await fetchTicketAccount(cluster.endpoint, ticket.publicKey)
      if (!ticketOnChain) throw new Error('Ticket not found on-chain')
      const ix = cancelListingInstruction(new PublicKey(ticket.eventKey), new PublicKey(ticket.publicKey), ticketOnChain.mint, publicKey)
      const sig = await sendTx(ix)
      toast.success('Listing cancelled!', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-listings'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to cancel listing.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setActionTicket(null) }
  }

  const handleTransfer = async () => {
    if (!selectedTicket || !publicKey || !transferAddr) return
    setProcessing(true)
    try {
      const recipient = new PublicKey(transferAddr)
      const ticketOnChain = await fetchTicketAccount(cluster.endpoint, selectedTicket.publicKey)
      if (!ticketOnChain) throw new Error('Ticket not found on-chain')
      const ix = transferTicketInstruction(new PublicKey(selectedTicket.eventKey), new PublicKey(selectedTicket.publicKey), ticketOnChain.mint, publicKey, recipient)
      const sig = await sendTx(ix)
      toast.success('Ticket transferred!', { description: sigDescription(sig) })
      setShowModal(null)
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to transfer.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setProcessing(false) }
  }

  const handleMintPoap = async (ticket: TicketlyTicket) => {
    if (!publicKey) return
    setActionTicket(ticket.publicKey)
    try {
      const ix = mintPoapInstruction(new PublicKey(ticket.eventKey), new PublicKey(ticket.publicKey), publicKey, publicKey, TOKEN_METADATA_PROGRAM)
      const sig = await sendTx(ix)
      toast.success('POAP minted!', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to mint POAP.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setActionTicket(null) }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="heading-display text-4xl md:text-5xl text-white mb-2">My <span className="gradient-text">Tickets</span></h1>
              <p className="text-white/40">Your on-chain tickets. Show QR at the gate for instant verification.</p>
            </div>
          </div>

          {!publicKey && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-white/50 text-lg">Connect a wallet to see your tickets.</p>
            </div>
          )}

          {publicKey && (
            <>
              {/* Tabs */}
              <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
                {(['upcoming', 'past', 'listed'] as Tab[]).map((tab) => {
                  const count = tickets.filter((t) => { const ev = events.find((e) => e.publicKey === t.eventKey); const end = ev ? Number(ev.eventEnd) : Infinity; if (tab === 'listed') return t.isListed; if (tab === 'past') return end < now && !t.isListed; return end >= now && !t.isListed }).length
                  return (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {count > 0 && <span className="ml-1.5 text-xs opacity-50">({count})</span>}
                    </button>
                  )
                })}
              </div>

              {isLoading && <div className="glass rounded-2xl p-8 text-center"><p className="text-white/50">Loading tickets from devnet...</p></div>}

              {!isLoading && filteredTickets.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-white/50">No {activeTab} tickets found.</p>
                </div>
              )}

              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.publicKey}
                    ticket={ticket}
                    event={getEvent(ticket.eventKey)}
                    onShowQR={() => { setSelectedTicket(ticket); setShowModal('qr') }}
                    onList={() => { setSelectedTicket(ticket); setListPrice(''); setShowModal('list') }}
                    onTransfer={() => { setSelectedTicket(ticket); setTransferAddr(''); setShowModal('transfer') }}
                    onCancelListing={() => handleCancelListing(ticket)}
                    onMintPoap={() => handleMintPoap(ticket)}
                    isProcessing={actionTicket === ticket.publicKey}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={() => !processing && setShowModal(null)}>
          <div className={`mx-4 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-2xl shadow-black/40 ${showModal === 'qr' ? 'max-w-xs p-5' : 'max-w-md p-6'} w-full`} onClick={(e) => e.stopPropagation()}>
            {showModal === 'qr' && (
              <div className="flex flex-col items-center gap-3">
                <h3 className="font-display text-base text-white tracking-wide">Ticket QR</h3>
                <p className="text-[11px] text-white/40">Show this at the gate</p>
                <div className="rounded-xl bg-dark-900/60 p-2.5 border border-white/5">
                  <QRCodeCanvas value={selectedTicket.publicKey} />
                </div>
                <p className="font-mono text-[10px] text-white/30 break-all leading-relaxed max-w-[200px] text-center">{selectedTicket.publicKey}</p>
                <button onClick={() => setShowModal(null)} className="w-full py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all">Close</button>
              </div>
            )}
            {showModal === 'list' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg text-white">List for Resale</h3>
                <p className="text-xs text-white/40">Set your asking price in SOL</p>
                {(() => {
                  const ev = selectedTicket ? events.find((e) => e.publicKey === selectedTicket.eventKey) : null
                  const cap = ev?.maxResalePrice != null ? lamportsToSol(Number(ev.maxResalePrice)) : null
                  return cap != null ? (
                    <p className="text-xs text-amber-400">Max resale price: {cap.toFixed(4)} SOL</p>
                  ) : null
                })()}
                <input type="number" step="0.001" min="0" placeholder="Price in SOL" value={listPrice} onChange={(e) => setListPrice(e.target.value)} className="input-field w-full" />
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(null)} className="btn-secondary flex-1 py-3" disabled={processing}>Cancel</button>
                  <button onClick={handleList} className="btn-primary flex-1 py-3" disabled={processing}>{processing ? 'Listing...' : 'List Ticket'}</button>
                </div>
              </div>
            )}
            {showModal === 'transfer' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg text-white">Transfer Ticket</h3>
                <p className="text-xs text-white/40">Enter the recipient wallet address</p>
                <input type="text" placeholder="Recipient wallet address" value={transferAddr} onChange={(e) => setTransferAddr(e.target.value)} className="input-field w-full" />
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(null)} className="btn-secondary flex-1 py-3" disabled={processing}>Cancel</button>
                  <button onClick={handleTransfer} className="btn-primary flex-1 py-3" disabled={processing}>{processing ? 'Transferring...' : 'Transfer'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

function TicketCard({ ticket, event, onShowQR, onList, onTransfer, onCancelListing, onMintPoap, isProcessing }: {
  ticket: TicketlyTicket
  event: TicketlyEvent | null
  onShowQR: () => void
  onList: () => void
  onTransfer: () => void
  onCancelListing: () => void
  onMintPoap: () => void
  isProcessing: boolean
}) {
  const tierName = TIER_NAMES[ticket.tierType] || `Tier ${ticket.tierIndex}`
  const eventName = event?.name || `Event ${ticket.eventKey.slice(0, 8)}...`
  const venue = event?.venue || 'Unknown Venue'
  const eventStart = event ? new Date(Number(event.eventStart) * 1000) : null
  const imageUri = event?.metadataUri || ''
  const hasRealImage = imageUri && !imageUri.includes('ticketly.dev/metadata')
  const organizer = event?.authority ? `${event.authority.slice(0, 4)}...${event.authority.slice(-4)}` : '—'

  return (
    <div className="ticket-card group overflow-hidden transition-all duration-300 hover:border-white/20">
      <div className="flex">
        {/* Left content */}
        <div className="flex-1 p-5 space-y-3 min-w-0">
          {/* Time */}
          {eventStart && (
            <p className="text-sm text-white/40 font-medium">
              {format(eventStart, 'h:mm a')}
            </p>
          )}

          {/* Event name */}
          <h3 className="font-display text-white text-xl leading-tight truncate">{eventName}</h3>

          {/* Organizer */}
          <div className="flex items-center gap-2 text-sm text-white/40">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[10px] text-white font-bold">
              {eventName.charAt(0).toUpperCase()}
            </div>
            <span>By {organizer}</span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-1.5 text-sm text-white/40">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{venue}</span>
          </div>

          {/* Badge row */}
          <div className="flex items-center gap-2 pt-1">
            <StatusBadge status={ticket.status} />
            <span className="text-xs text-white/30 font-mono">#{ticket.ticketNumber.toString()}</span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs text-white/30">{tierName}</span>
            {ticket.isListed && ticket.listedPriceSol && (
              <>
                <span className="text-xs text-white/30">·</span>
                <span className="text-xs text-brand-400 font-medium">{ticket.listedPriceSol.toFixed(4)} SOL</span>
              </>
            )}
          </div>
        </div>

        {/* Right image */}
        <div className="flex items-center pr-5 py-4 flex-shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-dark-800">
            {hasRealImage ? (
              <img src={imageUri} alt={eventName} className="w-full h-full object-cover" />
            ) : (
              <GeneratedBanner name={eventName} category={event?.symbol || ''} size="sm" showInitial={true} />
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-5 pb-4 pt-1">
        <button onClick={onShowQR} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
          <QrCode className="w-3.5 h-3.5" />
          QR Code
        </button>
        {ticket.status === 'valid' && !ticket.isListed && (
          <>
            <button onClick={onList} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
              <Tag className="w-3.5 h-3.5" />
              List for Sale
            </button>
            <button onClick={onTransfer} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer
            </button>
          </>
        )}
        {ticket.isListed && (
          <button onClick={onCancelListing} disabled={isProcessing} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40">
            <X className="w-3.5 h-3.5" />
            {isProcessing ? 'Cancelling...' : 'Cancel Listing'}
          </button>
        )}
        {ticket.isCheckedIn && !ticket.status.includes('poap') && (
          <button onClick={onMintPoap} disabled={isProcessing} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 transition-all disabled:opacity-40">
            <Award className="w-3.5 h-3.5" />
            {isProcessing ? 'Minting...' : 'Mint POAP'}
          </button>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    valid: { label: 'Going', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    checked_in: { label: 'Attended', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    listed: { label: 'Listed', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    expired: { label: 'Expired', cls: 'bg-white/10 text-white/40 border-white/10' },
  }[status] || { label: status, cls: 'bg-white/10 text-white/50 border-white/10' }
  return <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${config.cls}`}>{config.label}</span>
}

function QRCodeCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, { width: 160, margin: 2, color: { dark: '#FF5000', light: '#00000000' } }).catch(() => {})
    }
  }, [value])
  return <canvas ref={canvasRef} className="mx-auto rounded-xl" />
}
