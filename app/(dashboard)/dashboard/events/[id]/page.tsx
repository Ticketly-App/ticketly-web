'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useTicketlyEvent, mapTicketTier } from '@/hooks/use-ticketly-events'
import { updateEventInstruction, cancelEventInstruction } from '@/lib/ticketly/instructions'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
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

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 rounded bg-white/5 animate-pulse" /><div className="h-40 rounded-2xl bg-white/5 animate-pulse" /></div>
  if (!event) return <div className="glass rounded-2xl p-12 text-center"><p className="text-white/50">Event not found on devnet.</p></div>

  const tiers = event.ticketTiers.map(mapTicketTier)
  const isOwner = publicKey?.toBase58() === event.authority

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
      toast.error('Update failed.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setIsSubmitting(false) }
  }

  const handleCancel = async () => {
    if (!publicKey || !confirm('Are you sure you want to cancel this event? This cannot be undone.')) return
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
      toast.error('Cancel failed.', { description: err instanceof Error ? err.message : String(err) })
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
          <span className={`badge ${event.isCancelled ? 'bg-red-500/20 text-red-400 border-red-500/30' : event.isActive ? 'badge-active' : 'bg-white/10 text-white/50 border-white/10'}`}>
            {event.isCancelled ? 'Cancelled' : event.isActive ? 'Active' : 'Draft'}
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
            <p className={`font-display font-bold text-xl ${s.accent ? 'text-brand-400' : 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tiers */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="font-display font-semibold text-white">Ticket Tiers</h3>
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
      {isOwner && !event.isCancelled && (
        <div className="space-y-4">
          {!showEdit ? (
            <div className="flex gap-3">
              <button onClick={() => { setEditName(event.name); setEditVenue(event.venue); setEditDesc(event.description); setShowEdit(true) }} className="btn-secondary py-2 px-4">Edit Event</button>
              <button onClick={handleCancel} disabled={isSubmitting} className="btn-danger py-2 px-4 disabled:opacity-40">Cancel Event</button>
            </div>
          ) : (
            <div className="glass-strong rounded-2xl p-5 neon-border space-y-4">
              <h3 className="font-display font-semibold text-white">Edit Event</h3>
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
    </div>
  )
}
