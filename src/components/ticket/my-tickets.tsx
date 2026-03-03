'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useTicketlyTickets, type TicketlyTicket } from '@/hooks/use-ticketly-tickets'
import { useTicketlyEvents, type TicketlyEvent } from '@/hooks/use-ticketly-events'
import { useOrganizerProfiles, type OrganizerInfo } from '@/hooks/use-organizer-profiles'
import { GradientAvatar } from '@/components/ui/gradient-avatar'
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
import { parseTransactionError } from '@/lib/parse-transaction-error'
import { useQueryClient } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { XAuthGate } from '@/components/auth/XAuthGate'
import { GeneratedBanner } from '@/components/ui/GeneratedBanner'
import { MapPin, QrCode, ArrowRightLeft, Tag, X, Award, Calendar, Clock } from 'lucide-react'
import { format, isToday, isYesterday, isTomorrow } from 'date-fns'
import QRCode from 'qrcode'
import { OrganizerProfilePopup } from '@/components/organizer/OrganizerProfilePopup'

const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

type Tab = 'upcoming' | 'expired' | 'listed'

const TIER_NAMES: Record<string, string> = {
  '0': 'General Admission',
  '1': 'Early Bird',
  '2': 'VIP',
  '3': 'VVIP',
  '4': 'Custom',
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
  const [orgPopup, setOrgPopup] = useState<{ authority: string } | null>(null)

  // Collect all unique event authorities for organizer profile lookup
  // Collect all unique authorities from both events and tickets for robust lookup
  const eventAuthorities = useMemo(() => {
    const fromEvents = events.map((e) => e.authority)
    const fromTickets = tickets.map((t) => {
      const ev = events.find((e) => e.publicKey === t.eventKey)
      return ev?.authority || ''
    })
    return Array.from(new Set([...fromEvents, ...fromTickets].filter(Boolean)))
  }, [events, tickets])
  const { data: organizerProfiles } = useOrganizerProfiles(eventAuthorities)

  const now = Date.now() / 1000
  const filteredTickets = tickets.filter((t) => {
    const ev = events.find((e) => e.publicKey === t.eventKey)
    const eventEnd = ev ? Number(ev.eventEnd) : Infinity
    if (activeTab === 'listed') return t.isListed
    if (activeTab === 'expired') return (eventEnd < now || (ev?.isCancelled ?? false)) && !t.isListed
    return eventEnd >= now && !t.isListed && !(ev?.isCancelled ?? false)
  })

  // Group tickets by date for timeline
  const ticketsByDate = useMemo(() => {
    const groups = new Map<
      string,
      {
        date: Date
        label: string
        dayOfWeek: string
        tickets: { ticket: TicketlyTicket; event: TicketlyEvent | null }[]
      }
    >()

    // Sort by event start date (most recent first for past, soonest first for upcoming)
    const sorted = [...filteredTickets].sort((a, b) => {
      const evA = events.find((e) => e.publicKey === a.eventKey)
      const evB = events.find((e) => e.publicKey === b.eventKey)
      const startA = evA ? Number(evA.eventStart) : 0
      const startB = evB ? Number(evB.eventStart) : 0
      return activeTab === 'expired' ? startB - startA : startA - startB
    })

    for (const ticket of sorted) {
      const event = events.find((e) => e.publicKey === ticket.eventKey) || null
      const eventStart = event ? new Date(Number(event.eventStart) * 1000) : new Date()
      const dateKey = format(eventStart, 'yyyy-MM-dd')

      if (!groups.has(dateKey)) {
        let label: string
        if (isToday(eventStart)) label = 'Today'
        else if (isTomorrow(eventStart)) label = 'Tomorrow'
        else if (isYesterday(eventStart)) label = 'Yesterday'
        else label = format(eventStart, 'd MMM')

        groups.set(dateKey, {
          date: eventStart,
          label,
          dayOfWeek: format(eventStart, 'EEEE'),
          tickets: [],
        })
      }
      groups.get(dateKey)!.tickets.push({ ticket, event })
    }

    return [...groups.values()]
  }, [filteredTickets, events, activeTab])

  const getEvent = (eventKey: string) => {
    return events.find((e) => e.publicKey === eventKey) || null
  }

  const getOrganizer = (authority: string | undefined): OrganizerInfo | null => {
    if (!authority || !organizerProfiles) return null
    return organizerProfiles.get(authority) || null
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
      sig = await connection.sendRawTransaction(signedTx.serialize(), {
        preflightCommitment: 'confirmed',
        skipPreflight: false,
        maxRetries: 3,
      })
    } else {
      sig = await sendTransaction!(tx, connection)
    }
    await connection.confirmTransaction({ signature: sig, ...latestBlockhash }, 'confirmed')
    return sig
  }

  const handleList = async () => {
    if (!selectedTicket || !publicKey) return
    const price = parseFloat(listPrice)
    if (isNaN(price) || price <= 0) {
      toast.error('Enter a valid price.')
      return
    }
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
      const ix = listTicketInstruction(
        new PublicKey(selectedTicket.eventKey),
        new PublicKey(selectedTicket.publicKey),
        ticketOnChain.mint,
        publicKey,
        priceLamports,
      )
      const sig = await sendTx(ix)
      toast.success('Ticket listed!', { description: sigDescription(sig) })
      setShowModal(null)
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-listings'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to list ticket.', { description: parseTransactionError(err) })
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelListing = async (ticket: TicketlyTicket) => {
    if (!publicKey) return
    setActionTicket(ticket.publicKey)
    try {
      const ticketOnChain = await fetchTicketAccount(cluster.endpoint, ticket.publicKey)
      if (!ticketOnChain) throw new Error('Ticket not found on-chain')
      const ix = cancelListingInstruction(
        new PublicKey(ticket.eventKey),
        new PublicKey(ticket.publicKey),
        ticketOnChain.mint,
        publicKey,
      )
      const sig = await sendTx(ix)
      toast.success('Listing cancelled!', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-listings'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to cancel listing.', { description: parseTransactionError(err) })
    } finally {
      setActionTicket(null)
    }
  }

  const handleTransfer = async () => {
    if (!selectedTicket || !publicKey || !transferAddr) return
    setProcessing(true)
    try {
      const recipient = new PublicKey(transferAddr)
      const ticketOnChain = await fetchTicketAccount(cluster.endpoint, selectedTicket.publicKey)
      if (!ticketOnChain) throw new Error('Ticket not found on-chain')
      const ix = transferTicketInstruction(
        new PublicKey(selectedTicket.eventKey),
        new PublicKey(selectedTicket.publicKey),
        ticketOnChain.mint,
        publicKey,
        recipient,
      )
      const sig = await sendTx(ix)
      toast.success('Ticket transferred!', { description: sigDescription(sig) })
      setShowModal(null)
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to transfer.', { description: parseTransactionError(err) })
    } finally {
      setProcessing(false)
    }
  }

  const handleMintPoap = async (ticket: TicketlyTicket) => {
    if (!publicKey) return
    setActionTicket(ticket.publicKey)
    try {
      const ix = mintPoapInstruction(
        new PublicKey(ticket.eventKey),
        new PublicKey(ticket.publicKey),
        publicKey,
        publicKey,
        TOKEN_METADATA_PROGRAM,
      )
      const sig = await sendTx(ix)
      toast.success('POAP minted!', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-tickets'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to mint POAP.', { description: parseTransactionError(err) })
    } finally {
      setActionTicket(null)
    }
  }

  return (
    <XAuthGate message="Verify your X (Twitter) account to view your tickets and manage your collection.">
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <main className="pt-28 pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="heading-display text-4xl md:text-5xl text-white mb-2">My Tickets</h1>
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
                  {(['upcoming', 'expired', 'listed'] as Tab[]).map((tab) => {
                    const count = tickets.filter((t) => {
                      const ev = events.find((e) => e.publicKey === t.eventKey)
                      const end = ev ? Number(ev.eventEnd) : Infinity
                      if (tab === 'listed') return t.isListed
                      if (tab === 'expired') return (end < now || (ev?.isCancelled ?? false)) && !t.isListed
                      return end >= now && !t.isListed && !(ev?.isCancelled ?? false)
                    }).length
                    const tabLabels: Record<Tab, string> = {
                      upcoming: 'Upcoming',
                      expired: 'Expired',
                      listed: 'Listed',
                    }
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                      >
                        {tabLabels[tab]}
                        {count > 0 && <span className="ml-1.5 text-xs opacity-50">({count})</span>}
                      </button>
                    )
                  })}
                </div>

                {isLoading && (
                  <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-white/50">Loading tickets from devnet...</p>
                  </div>
                )}

                {!isLoading && filteredTickets.length === 0 && (
                  <div className="glass rounded-2xl p-12 text-center">
                    <p className="text-white/50">No {activeTab} tickets found.</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-8">
                  {ticketsByDate.map((group, groupIdx) => (
                    <div key={group.label + groupIdx} className="relative">
                      {/* Date header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-display text-xl text-white tracking-wide">{group.label}</span>
                          <span className="text-sm text-white/30 font-medium">{group.dayOfWeek}</span>
                        </div>
                        <div className="flex-1 h-px bg-white/08" />
                      </div>

                      {/* Timeline rail + cards */}
                      <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/08" />

                        <div className="space-y-3">
                          {group.tickets.map(({ ticket, event }, idx) => (
                            <div key={ticket.publicKey} className="relative">
                              {/* Timeline dot */}
                              <div className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full border-2 border-dark-950 bg-brand-500/60" />

                              <TicketCard
                                ticket={ticket}
                                event={event}
                                organizer={getOrganizer(event?.authority)}
                                allEvents={events}
                                onShowQR={() => {
                                  setSelectedTicket(ticket)
                                  setShowModal('qr')
                                }}
                                onList={() => {
                                  setSelectedTicket(ticket)
                                  setListPrice('')
                                  setShowModal('list')
                                }}
                                onTransfer={() => {
                                  setSelectedTicket(ticket)
                                  setTransferAddr('')
                                  setShowModal('transfer')
                                }}
                                onCancelListing={() => handleCancelListing(ticket)}
                                onMintPoap={() => handleMintPoap(ticket)}
                                isProcessing={actionTicket === ticket.publicKey}
                                setOrgPopup={setOrgPopup}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Organizer Profile Popup (global, not per card) */}
                {orgPopup && (
                  <OrganizerProfilePopup
                    organizer={(() => {
                      // Try to find organizer by authority
                      if (!organizerProfiles) return null
                      const org = organizerProfiles.get(orgPopup.authority) ?? null
                      if (org) return org
                      // Fallback: try to find event with this authority and get its organizer
                      const ev = events.find((e) => e.authority === orgPopup.authority)
                      const fallbackOrg = ev ? (organizerProfiles.get(ev.authority) ?? null) : null
                      if (fallbackOrg) return fallbackOrg
                      return null
                    })()}
                    authority={typeof orgPopup.authority === 'string' ? orgPopup.authority : ''}
                    allEvents={events}
                    onClose={() => setOrgPopup(null)}
                  />
                )}
              </>
            )}
          </div>
        </main>

        {/* Modals */}
        {showModal && selectedTicket && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => !processing && setShowModal(null)}
          >
            <div
              className={`mx-4 w-full ${showModal === 'qr' ? 'max-w-[380px]' : 'rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-2xl shadow-black/40 max-w-md p-6'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {showModal === 'qr' &&
                (() => {
                  const ev = events.find((e) => e.publicKey === selectedTicket.eventKey) || null
                  const org = ev && organizerProfiles ? organizerProfiles.get(ev.authority) || null : null
                  return (
                    <TicketGraphic
                      ticket={selectedTicket}
                      event={ev}
                      organizer={org}
                      onClose={() => setShowModal(null)}
                    />
                  )
                })()}
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
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Price in SOL"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="input-field w-full"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowModal(null)}
                      className="btn-secondary flex-1 py-3"
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button onClick={handleList} className="btn-primary flex-1 py-3" disabled={processing}>
                      {processing ? 'Listing...' : 'List Ticket'}
                    </button>
                  </div>
                </div>
              )}
              {showModal === 'transfer' && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg text-white">Transfer Ticket</h3>
                  <p className="text-xs text-white/40">Enter the recipient wallet address</p>
                  <input
                    type="text"
                    placeholder="Recipient wallet address"
                    value={transferAddr}
                    onChange={(e) => setTransferAddr(e.target.value)}
                    className="input-field w-full"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowModal(null)}
                      className="btn-secondary flex-1 py-3"
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button onClick={handleTransfer} className="btn-primary flex-1 py-3" disabled={processing}>
                      {processing ? 'Transferring...' : 'Transfer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <Footer />
      </div>
    </XAuthGate>
  )
}

function TicketCard({
  ticket,
  event,
  organizer,
  allEvents,
  onShowQR,
  onList,
  onTransfer,
  onCancelListing,
  onMintPoap,
  isProcessing,
  setOrgPopup,
}: {
  ticket: TicketlyTicket
  event: TicketlyEvent | null
  organizer: OrganizerInfo | null
  allEvents: TicketlyEvent[]
  onShowQR: () => void
  onList: () => void
  onTransfer: () => void
  onCancelListing: () => void
  onMintPoap: () => void
  isProcessing: boolean
  setOrgPopup: (popup: { authority: string } | null) => void
}) {
  const tierName = TIER_NAMES[ticket.tierType] || `Tier ${ticket.tierIndex}`
  const eventName = event?.name || `Event ${ticket.eventKey.slice(0, 8)}...`
  const venue = event?.venue || 'Unknown Venue'
  const eventStart = event ? new Date(Number(event.eventStart) * 1000) : null
  const imageUri = event?.metadataUri || ''
  const hasRealImage = imageUri && !imageUri.includes('ticketly.dev/metadata')

  const { data: events = [] } = useTicketlyEvents()
  const eventAuthorities = useMemo(() => events.map((e) => e.authority), [events])
  const { data: organizerProfiles } = useOrganizerProfiles(eventAuthorities)
  const eventMap = new Map(events.map((e) => [e.publicKey, e]))
  const ev = eventMap.get(ticket.eventKey)

  const orgProfile = ev ? organizerProfiles?.get(ev.authority) : null
  const orgHandle = orgProfile?.username || null
  const orgName = orgProfile?.name || (ev?.authority ? `${ev.authority.slice(0, 4)}...${ev.authority.slice(-4)}` : '—')
  const orgLogo = orgProfile?.logoUri || ''

  const organizerDisplay = organizer?.username ? `@${organizer.username}` : organizer?.name || ''
  const shortKey = ticket.publicKey.slice(0, 6) + '···' + ticket.publicKey.slice(-6)

  return (
    <>
      <div className="ticket-card group">
        {/* Subtle gradient shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-brand-500/[0.02] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative flex flex-col sm:flex-row">
          {/* Left content */}
          <div className="flex-1 p-4 sm:p-5 space-y-2.5 sm:space-y-3 min-w-0">
            {/* Time */}
            {eventStart && (
              <p className="text-xs sm:text-sm text-white/35 font-medium tracking-wide">
                {format(eventStart, 'h:mm a')}
              </p>
            )}

            {/* Event name */}
            <h3 className="font-display text-white text-lg sm:text-xl leading-tight truncate pr-2">{eventName}</h3>

            {/* Organizer - clickable to show profile popup */}
            {organizer ? (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => ev && setOrgPopup({ authority: ev.authority })}
                  className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-brand-400 transition-colors min-w-0"
                >
                  <OrganizerAvatar
                    logoUri={orgLogo}
                    authority={ev?.authority ?? ''}
                    name={ev?.name ?? ''}
                    size={24}
                    className="mr-2"
                  />
                  <span className="truncate">{orgHandle ? `@${orgHandle}` : orgName}</span>
                </button>
              </div>
            ) : (
              <GradientAvatar
                seed={event?.authority || eventName}
                name={eventName}
                size={32}
                className="ring-1 ring-white/10"
              />
            )}

            {/* Venue */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/35">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{venue}</span>
            </div>

            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
              <StatusBadge status={ticket.status} />
              {event?.isCancelled && (
                <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-red-500/20 text-red-400 border-red-500/30">
                  Cancelled
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-white/25 font-mono">#{ticket.ticketNumber.toString()}</span>
              <span className="text-[10px] sm:text-xs text-white/20">·</span>
              <span className="text-[10px] sm:text-xs text-white/25">{tierName}</span>
              {ticket.isListed && ticket.listedPriceSol && (
                <>
                  <span className="text-[10px] sm:text-xs text-white/20">·</span>
                  <span className="text-[10px] sm:text-xs text-brand-400 font-medium">
                    {ticket.listedPriceSol.toFixed(4)} SOL
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right image */}
          <div className="hidden sm:flex items-center pr-5 py-4 flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-dark-800 ring-1 ring-white/[0.06] shadow-lg shadow-black/30">
              {hasRealImage ? (
                <img src={imageUri} alt={eventName} className="w-full h-full object-cover" />
              ) : (
                <GeneratedBanner name={eventName} category={event?.symbol || ''} size="sm" showInitial={true} />
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative flex flex-wrap items-center gap-1.5 sm:gap-2 px-4 sm:px-5 pb-4 pt-1">
          <div className="absolute top-0 left-4 right-4 sm:left-5 sm:right-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <ActionBtn onClick={onShowQR} icon={<QrCode className="w-3.5 h-3.5" />} label="Ticket" />
          {ticket.status === 'valid' && !ticket.isListed && !event?.isCancelled && (
            <>
              <ActionBtn onClick={onList} icon={<Tag className="w-3.5 h-3.5" />} label="List for Sale" />
              <ActionBtn onClick={onTransfer} icon={<ArrowRightLeft className="w-3.5 h-3.5" />} label="Transfer" />
            </>
          )}
          {ticket.isListed && (
            <button
              onClick={onCancelListing}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
            >
              <X className="w-3.5 h-3.5" />
              {isProcessing ? 'Cancelling...' : 'Cancel Listing'}
            </button>
          )}
          {ticket.isCheckedIn && !ticket.poapMinted && (
            <button
              onClick={onMintPoap}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 transition-all disabled:opacity-40"
            >
              <Award className="w-3.5 h-3.5" />
              {isProcessing ? 'Minting...' : 'Mint POAP'}
            </button>
          )}
          {ticket.poapMinted && (
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/30 cursor-default">
              <Award className="w-3.5 h-3.5" />
              POAP Minted
            </span>
          )}
        </div>
      </div>
    </>
  )
}

function ActionBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] backdrop-blur-sm transition-all"
    >
      {icon}
      <span className="hidden xs:inline sm:inline">{label}</span>
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    valid: { label: 'Going', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    checked_in: { label: 'Attended', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    listed: { label: 'Listed', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    expired: { label: 'Expired', cls: 'bg-white/10 text-white/40 border-white/10' },
  }[status] || { label: status, cls: 'bg-white/10 text-white/50 border-white/10' }
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${config.cls}`}
    >
      {config.label}
    </span>
  )
}

function TicketGraphic({
  ticket,
  event,
  organizer,
  onClose,
}: {
  ticket: TicketlyTicket
  event: TicketlyEvent | null
  organizer: OrganizerInfo | null
  onClose: () => void
}) {
  const tierName = TIER_NAMES[ticket.tierType] || `Tier ${ticket.tierIndex}`
  const eventName = event?.name || `Event ${ticket.eventKey.slice(0, 8)}...`
  const venue = event?.venue || 'Unknown Venue'
  const eventStart = event ? new Date(Number(event.eventStart) * 1000) : null
  const imageUri = event?.metadataUri || ''
  const hasRealImage = imageUri && !imageUri.includes('ticketly.dev/metadata')
  const isVip = ticket.tierType === '2' || ticket.tierType === '3'

  const organizerDisplay = organizer?.username ? `@${organizer.username}` : organizer?.name || ''
  const shortKey = ticket.publicKey.slice(0, 6) + '···' + ticket.publicKey.slice(-6)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0c0c0e] border border-white/[0.08] shadow-2xl shadow-black/60">
      {/* Top accent */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-500/80 to-transparent" />

      {/* Close btn */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/50 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* ── Banner ── */}
      <div className="relative h-32 overflow-hidden">
        {hasRealImage ? (
          <img src={imageUri} alt={eventName} className="w-full h-full object-cover" />
        ) : (
          <GeneratedBanner name={eventName} category={event?.symbol || ''} size="sm" />
        )}
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/50 to-black/20" />

        {/* TICKETLY watermark */}
        <div className="absolute top-4 right-4">
          <span className="font-display text-[11px] tracking-[0.25em] text-white/10 uppercase">Ticketly</span>
        </div>

        {/* Tier badge + ticket # */}
        <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-sm ${
              isVip
                ? 'bg-brand-500/25 text-brand-300 border border-brand-500/30'
                : 'bg-white/10 text-white/50 border border-white/10'
            }`}
          >
            {tierName}
          </span>
          <span className="text-[11px] font-mono text-white/25 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
            #{ticket.ticketNumber.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* ── Details ── */}
      <div className="px-5 pt-4 pb-4">
        <h2 className="font-display text-2xl text-white leading-tight mb-0.5 truncate">{eventName}</h2>

        {organizerDisplay && (
          <p className="text-xs text-brand-400/60 mb-4 flex items-center gap-1.5">
            <OrganizerAvatar
              logoUri={organizer?.logoUri}
              authority={event?.authority || eventName}
              name={organizer?.name || eventName}
              size={16}
            />
            {organizerDisplay}
          </p>
        )}
        {!organizerDisplay && <div className="mb-4" />}

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2">
          {eventStart && (
            <InfoCell
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Date"
              value={format(eventStart, 'MMM d, yyyy')}
            />
          )}
          {eventStart && (
            <InfoCell icon={<Clock className="w-3.5 h-3.5" />} label="Time" value={format(eventStart, 'h:mm a')} />
          )}
          <InfoCell icon={<MapPin className="w-3.5 h-3.5" />} label="Venue" value={venue} truncate />
          <InfoCell
            icon={<Tag className="w-3.5 h-3.5" />}
            label="Price"
            value={ticket.pricePaidSol > 0 ? `${ticket.pricePaidSol.toFixed(4)} SOL` : 'Free'}
          />
        </div>
      </div>

      {/* ── Perforated tear line ── */}
      <div className="relative h-7 flex items-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-black shadow-[inset_0_0_4px_rgba(255,255,255,0.04)]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 rounded-full bg-black shadow-[inset_0_0_4px_rgba(255,255,255,0.04)]" />
        <div className="w-full border-t-2 border-dashed border-white/[0.06] mx-6" />
      </div>

      {/* ── QR Section ── */}
      <div className="px-5 pt-2 pb-5 flex flex-col items-center">
        <div className="relative rounded-xl bg-white/[0.03] p-3 border border-white/[0.06] mb-3 group">
          <div className="absolute -inset-0.5 rounded-xl bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
          <div className="relative">
            <QRCodeCanvas value={ticket.publicKey} />
          </div>
        </div>
        <p className="text-[11px] text-white/35 font-medium mb-1.5">Show this at the gate</p>
        <p className="font-mono text-[10px] text-white/20 tracking-wide">{shortKey}</p>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0" />
    </div>
  )
}

function InfoCell({
  icon,
  label,
  value,
  truncate,
}: {
  icon: React.ReactNode
  label: string
  value: string
  truncate?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04]">
      <div className="text-brand-500/50 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] text-white/20 uppercase tracking-wider font-medium leading-none mb-0.5">{label}</p>
        <p className={`text-[11px] text-white/70 font-medium leading-tight ${truncate ? 'truncate' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

function QRCodeCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 160,
        margin: 2,
        color: { dark: '#FF5000', light: '#00000000' },
      }).catch(() => {})
    }
  }, [value])
  return <canvas ref={canvasRef} className="mx-auto rounded-xl" />
}

// OrganizerAvatar: shows image, falls back to GradientAvatar on error
function OrganizerAvatar({
  logoUri,
  authority,
  name,
  size = 20,
  className = '',
}: {
  logoUri?: string
  authority: string
  name: string
  size?: number
  className?: string
}) {
  const [error, setError] = useState(false)
  if (error || !logoUri) {
    return <GradientAvatar seed={authority || name} name={name} size={size} className={className} />
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
