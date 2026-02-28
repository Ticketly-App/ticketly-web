'use client'

import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useTicketlyTickets, type TicketlyTicket } from '@/hooks/use-ticketly-tickets'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
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

  const getEventName = (eventKey: string) => {
    const ev = events.find((e) => e.publicKey === eventKey)
    return ev?.name || `Event ${eventKey.slice(0, 8)}...`
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="badge badge-active mb-4">My Collection</div>
            <h1 className="heading-display text-4xl md:text-5xl text-white mb-3">My <span className="gradient-text">Tickets</span></h1>
            <p className="text-white/40">Your on-chain tickets. Show QR at the gate for instant verification.</p>
          </div>

          {!publicKey && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-white/50 text-lg">Connect a wallet to see your tickets.</p>
            </div>
          )}

          {publicKey && (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {(['upcoming', 'past', 'listed'] as Tab[]).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : 'glass border border-white/08 text-white/50 hover:text-white'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className="ml-1.5 text-xs opacity-60">({tickets.filter((t) => { const ev = events.find((e) => e.publicKey === t.eventKey); const end = ev ? Number(ev.eventEnd) : Infinity; if (tab === 'listed') return t.isListed; if (tab === 'past') return end < now && !t.isListed; return end >= now && !t.isListed }).length})</span>
                  </button>
                ))}
              </div>

              {isLoading && <div className="glass rounded-2xl p-8 text-center"><p className="text-white/50">Loading tickets from devnet...</p></div>}

              {!isLoading && filteredTickets.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-white/50">No {activeTab} tickets found.</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.publicKey}
                    ticket={ticket}
                    eventName={getEventName(ticket.eventKey)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !processing && setShowModal(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full mx-4 neon-border" onClick={(e) => e.stopPropagation()}>
            {showModal === 'qr' && (
              <div className="space-y-4 text-center">
                <h3 className="font-display text-lg text-white">Ticket QR Code</h3>
                <p className="text-xs text-white/40">Show this at the gate for verification</p>
                <QRCodeCanvas value={selectedTicket.publicKey} />
                <p className="font-mono text-xs text-white/40 break-all">{selectedTicket.publicKey}</p>
                <button onClick={() => setShowModal(null)} className="btn-secondary w-full py-3">Close</button>
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

function TicketCard({ ticket, eventName, onShowQR, onList, onTransfer, onCancelListing, onMintPoap, isProcessing }: {
  ticket: TicketlyTicket
  eventName: string
  onShowQR: () => void
  onList: () => void
  onTransfer: () => void
  onCancelListing: () => void
  onMintPoap: () => void
  isProcessing: boolean
}) {
  const tierName = TIER_NAMES[ticket.tierType] || `Tier ${ticket.tierIndex}`

  return (
    <div className="ticket-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 font-mono">#{ticket.ticketNumber.toString()}</p>
          <h3 className="font-display text-white text-lg">{eventName}</h3>
          <p className="text-sm text-white/50">{tierName}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>Paid: {ticket.pricePaidSol.toFixed(4)} SOL</span>
        <span>Minted: {new Date(Number(ticket.mintedAt) * 1000).toLocaleDateString()}</span>
        {ticket.isListed && ticket.listedPriceSol && <span className="text-brand-400">Listed: {ticket.listedPriceSol.toFixed(4)} SOL</span>}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button onClick={onShowQR} className="btn-secondary text-xs px-3 py-1.5">QR Code</button>
        {ticket.status === 'valid' && !ticket.isListed && (
          <>
            <button onClick={onList} className="btn-secondary text-xs px-3 py-1.5">List for Sale</button>
            <button onClick={onTransfer} className="btn-secondary text-xs px-3 py-1.5">Transfer</button>
          </>
        )}
        {ticket.isListed && (
          <button onClick={onCancelListing} disabled={isProcessing} className="btn-danger text-xs px-3 py-1.5 disabled:opacity-40">
            {isProcessing ? 'Cancelling...' : 'Cancel Listing'}
          </button>
        )}
        {ticket.isCheckedIn && !ticket.status.includes('poap') && (
          <button onClick={onMintPoap} disabled={isProcessing} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40">
            {isProcessing ? 'Minting...' : 'Mint POAP'}
          </button>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    valid: { label: 'Active', cls: 'badge-active' },
    checked_in: { label: 'Used', cls: 'bg-white/10 text-white/50 border-white/10' },
    listed: { label: 'Listed', cls: 'badge-vip' },
    expired: { label: 'Expired', cls: 'bg-white/10 text-white/40 border-white/10' },
  }[status] || { label: status, cls: 'bg-white/10 text-white/50 border-white/10' }
  return <span className={`badge ${config.cls}`}>{config.label}</span>
}

function QRCodeCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, { width: 200, margin: 2, color: { dark: '#FF5000', light: '#0a0a0f' } }).catch(() => {})
    }
  }, [value])
  return <canvas ref={canvasRef} className="mx-auto rounded-xl" />
}
