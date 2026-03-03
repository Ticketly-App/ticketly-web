'use client'

import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useTicketlyEvent, mapTicketTier } from '@/hooks/use-ticketly-events'
import { updateEventInstruction, cancelEventInstruction, refundTicketInstruction } from '@/lib/ticketly/instructions'
import { lamportsToSol, fetchTicketAccounts, type TicketlyTicketAccount } from '@/lib/ticketly/ticketly-query'
import { findRefundRecordAddress } from '@/lib/ticketly/pdas'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { parseTransactionError } from '@/lib/parse-transaction-error'
import { useQueryClient } from '@tanstack/react-query'

const TIER_NAMES: Record<string, string> = { '0': 'General Admission', '1': 'Early Bird', '2': 'VIP', '3': 'VVIP', '4': 'Custom' }

export default function EventManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const { data: event, isLoading, refetch } = useTicketlyEvent(id)
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editName, setEditName] = useState('')
  const [editVenue, setEditVenue] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Refund state
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundProgress, setRefundProgress] = useState<{ total: number; completed: number; failed: number } | null>(null)
  const [refundedTickets, setRefundedTickets] = useState<Set<string>>(new Set())

  const handleRefundAll = useCallback(async () => {
    if (!publicKey || !event) return
    setIsRefunding(true)
    setRefundProgress(null)

    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')

      // 1. Fetch all tickets and filter for this event
      const eventPda = new PublicKey(event.publicKey)
      const allTickets = await fetchTicketAccounts(cluster.endpoint)
      const eventTickets = allTickets.filter(
        (t) => t.account.event.toBase58() === eventPda.toBase58()
      )

      if (eventTickets.length === 0) {
        toast.info('No tickets found for this event.')
        setIsRefunding(false)
        return
      }

      // 2. Check which tickets are already refunded by checking if RefundRecord PDA exists
      const unreffunded: TicketlyTicketAccount[] = []
      const alreadyRefunded = new Set<string>(refundedTickets)

      const refundRecordKeys = eventTickets.map((t) => {
        const [refundPda] = findRefundRecordAddress(new PublicKey(t.pubkey))
        return refundPda
      })

      const refundRecordInfos = await connection.getMultipleAccountsInfo(refundRecordKeys)
      for (let i = 0; i < eventTickets.length; i++) {
        if (refundRecordInfos[i]) {
          alreadyRefunded.add(eventTickets[i].pubkey)
        } else {
          unreffunded.push(eventTickets[i])
        }
      }

      setRefundedTickets(alreadyRefunded)

      if (unreffunded.length === 0) {
        toast.success('All tickets have already been refunded!')
        setIsRefunding(false)
        return
      }

      const progress = { total: unreffunded.length, completed: 0, failed: 0 }
      setRefundProgress({ ...progress })

      // 3. Process refunds one-by-one (each creates a PDA so separate txs are safer)
      for (const ticket of unreffunded) {
        try {
          const ticketPda = new PublicKey(ticket.pubkey)
          const ticketOwner = ticket.account.owner

          const ix = refundTicketInstruction(
            publicKey,
            BigInt(event.id),
            eventPda,
            ticketPda,
            ticketOwner,
          )

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

          progress.completed++
          setRefundProgress({ ...progress })
          setRefundedTickets((prev) => new Set([...prev, ticket.pubkey]))
        } catch (err) {
          console.error(`Refund failed for ticket ${ticket.pubkey}:`, err)
          progress.failed++
          setRefundProgress({ ...progress })
        }
      }

      if (progress.failed === 0) {
        toast.success(`All ${progress.completed} ticket holders refunded!`)
      } else {
        toast.warning(`Refunded ${progress.completed}/${progress.total}. ${progress.failed} failed — you can retry.`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Refund failed.', { description: parseTransactionError(err) })
    } finally {
      setIsRefunding(false)
    }
  }, [publicKey, event, cluster.endpoint, signTransaction, sendTransaction, refundedTickets])

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 rounded bg-white/5 animate-pulse" /><div className="h-40 rounded-2xl bg-white/5 animate-pulse" /></div>
  if (!event) return <div className="glass rounded-2xl p-12 text-center"><p className="text-white/50">Event not found on devnet.</p></div>

  const tiers = event.ticketTiers.map(mapTicketTier)
  const isOwner = publicKey?.toBase58() === event.authority
  const isCompleted = Number(event.eventEnd) * 1000 < Date.now()
  const canManage = isOwner && !event.isCancelled && !isCompleted

  const sendTx = async (ix: any) => {
    if (!publicKey) throw new Error('Wallet not connected')
    const connection = new Connection(cluster.endpoint, 'confirmed')
    const tx = new Transaction().add(ix)
    tx.feePayer = publicKey
    const latestBlockhash = await connection.getLatestBlockhash()
    tx.recentBlockhash = latestBlockhash.blockhash
    let sig: string
    if (signTransaction) {
      const signedTx = await signTransaction(tx)
      sig = await connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: 'confirmed', skipPreflight: false, maxRetries: 3 })
    } else { sig = await sendTransaction!(tx, connection) }
    await connection.confirmTransaction({ signature: sig, ...latestBlockhash }, 'confirmed')
    return sig
  }

  const handleUpdate = async () => {
    if (!publicKey) return
    setIsSubmitting(true)
    try {
      const ix = updateEventInstruction(publicKey, BigInt(event.id), {
        name: editName || undefined,
        venue: editVenue || undefined,
        description: editDesc || undefined,
      })
      const sig = await sendTx(ix)
      toast.success('Event updated!', { description: sigDescription(sig) })
      setShowEdit(false)
      await queryClient.invalidateQueries({ queryKey: ['ticketly-events'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-event'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Update failed.', { description: parseTransactionError(err) })
    } finally { setIsSubmitting(false) }
  }

  const handleCancel = async () => {
    if (!publicKey) return
    setIsSubmitting(true)
    try {
      const ix = cancelEventInstruction(publicKey, BigInt(event.id))
      const sig = await sendTx(ix)
      toast.success('Event cancelled.', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-events'] })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-event'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Cancel failed.', { description: parseTransactionError(err) })
    } finally { setIsSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl text-white mb-2">{event.name}</h1>
          <p className="text-white/40 text-sm">{event.description}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`badge ${event.isCancelled ? 'bg-red-500/20 text-red-400 border-red-500/30' : isCompleted ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : event.isActive ? 'badge-active' : 'bg-white/10 text-white/50 border-white/10'}`}>
            {event.isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : event.isActive ? 'Active' : 'Draft'}
          </span>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Tickets Sold', value: Number(event.totalMinted).toString(), accent: false },
          { label: 'Checked In', value: Number(event.totalCheckedIn).toString(), accent: false },
          { label: 'Revenue', value: `${lamportsToSol(Number(event.totalRevenue)).toFixed(4)} SOL`, accent: true },
          { label: 'Tiers', value: tiers.length.toString(), accent: false },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`font-display text-xl ${s.accent ? 'text-brand-400' : 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tiers */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="font-display text-white">Ticket Tiers</h3>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div key={i} className="flex items-center justify-between glass rounded-xl p-3">
              <div>
                <span className="text-sm font-medium text-white">{TIER_NAMES[tier.tierType] || `Tier ${i}`}</span>
                <span className="text-xs text-white/40 ml-3">{tier.minted}/{tier.supply} sold</span>
              </div>
              <span className="font-mono font-semibold text-brand-400">{tier.priceSol.toFixed(4)} SOL</span>
            </div>
          ))}
        </div>
      </div>

      {/* Management Links */}
      <div className="grid gap-3 md:grid-cols-3">
        <Link href={`/dashboard/events/${id}/analytics`} className="glass rounded-xl p-4 hover:bg-white/05 transition-colors group">
          <p className="font-semibold text-white group-hover:text-brand-400 transition-colors">Analytics</p>
          <p className="text-xs text-white/40">View charts and metrics</p>
        </Link>
        <Link href={`/dashboard/events/${id}/operators`} className="glass rounded-xl p-4 hover:bg-white/05 transition-colors group">
          <p className="font-semibold text-white group-hover:text-brand-400 transition-colors">Operators</p>
          <p className="text-xs text-white/40">Manage gate operators</p>
        </Link>
        <Link href={`/dashboard/events/${id}/whitelist`} className="glass rounded-xl p-4 hover:bg-white/05 transition-colors group">
          <p className="font-semibold text-white group-hover:text-brand-400 transition-colors">Whitelist</p>
          <p className="text-xs text-white/40">Manage allowed wallets</p>
        </Link>
      </div>

      {/* Edit Section */}
      {isOwner && (
        <div className="space-y-4">
          {!showEdit ? (
            <div className="flex gap-3">
              <button
                onClick={() => { setEditName(event.name); setEditVenue(event.venue); setEditDesc(event.description); setShowEdit(true) }}
                disabled={!canManage}
                className="btn-secondary py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                title={isCompleted ? 'Cannot edit a completed event' : event.isCancelled ? 'Cannot edit a cancelled event' : undefined}
              >Edit Event</button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isSubmitting || !canManage}
                className="btn-danger py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                title={isCompleted ? 'Cannot cancel a completed event' : event.isCancelled ? 'Event already cancelled' : undefined}
              >Cancel Event</button>
            </div>
          ) : (
            <div className="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
              <h3 className="font-display text-white">Edit Event</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/60 uppercase tracking-wider">Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60 uppercase tracking-wider">Venue</label>
                  <input type="text" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} className="input-field w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60 uppercase tracking-wider">Description</label>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="input-field w-full resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEdit(false)} className="btn-secondary py-2 px-4">Cancel</button>
                <button onClick={handleUpdate} disabled={isSubmitting} className="btn-primary py-2 px-4 disabled:opacity-40">{isSubmitting ? 'Updating...' : 'Save Changes'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowCancelConfirm(false)}>
          <div className="mx-4 max-w-sm w-full rounded-2xl border border-white/10 bg-dark-800 p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl text-white">Cancel Event</h3>
            <p className="text-sm text-white/50">Are you sure you want to cancel this event? This cannot be undone. All ticket holders will be affected.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCancelConfirm(false)} disabled={isSubmitting} className="btn-secondary flex-1 py-2.5">Go Back</button>
              <button onClick={() => { setShowCancelConfirm(false); handleCancel() }} disabled={isSubmitting} className="btn-danger flex-1 py-2.5">{isSubmitting ? 'Cancelling...' : 'Yes, Cancel Event'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Section — shown when event is cancelled and has sold tickets */}
      {isOwner && event.isCancelled && Number(event.totalMinted) > 0 && (
        <div className="glass-strong rounded-2xl p-5 border border-amber-500/20 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-white text-lg">Refund Ticket Holders</h3>
              <p className="text-sm text-white/50 mt-1">
                This event has been cancelled. Refund the primary ticket price to all {Number(event.totalMinted)} current ticket holder{Number(event.totalMinted) > 1 ? 's' : ''}. 
                The refund goes to whoever currently owns each ticket (including marketplace buyers).
              </p>
            </div>
          </div>

          {/* Progress */}
          {refundProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">
                  Refunded: <span className="text-green-400 font-semibold">{refundProgress.completed}</span>
                  {refundProgress.failed > 0 && (
                    <> · Failed: <span className="text-red-400 font-semibold">{refundProgress.failed}</span></>
                  )}
                  {' '}/ {refundProgress.total}
                </span>
                <span className="text-white/40 text-xs">
                  {Math.round(((refundProgress.completed + refundProgress.failed) / refundProgress.total) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300"
                  style={{ width: `${Math.round(((refundProgress.completed + refundProgress.failed) / refundProgress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleRefundAll}
            disabled={isRefunding}
            className="btn-primary py-2.5 px-5 w-full sm:w-auto disabled:opacity-40"
          >
            {isRefunding
              ? `Refunding${refundProgress ? ` (${refundProgress.completed + refundProgress.failed}/${refundProgress.total})` : '...'}`
              : refundProgress && refundProgress.failed > 0
                ? 'Retry Failed Refunds'
                : 'Refund All Holders'}
          </button>
        </div>
      )}
    </div>
  )
}
