'use client'

import { useState, useMemo } from 'react'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { withdrawRevenueInstruction } from '@/lib/ticketly/instructions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

export default function RevenuePage() {
  const queryClient = useQueryClient()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const { data: events = [], isLoading, refetch } = useTicketlyEvents()
  const [withdrawingEvent, setWithdrawingEvent] = useState<string | null>(null)
  const [withdrawingAll, setWithdrawingAll] = useState(false)

  const myEvents = publicKey ? events.filter((e) => e.authority === publicKey.toBase58()) : []

  // Get rent-exempt minimum for event accounts (all have same data size)
  const eventDataLen = myEvents[0]?.accountDataLen ?? 0
  const { data: rentExemptMin = 0 } = useQuery({
    queryKey: ['rent-exempt-min', cluster.endpoint, eventDataLen],
    queryFn: async () => {
      if (eventDataLen === 0) return 0
      const connection = new Connection(cluster.endpoint, 'confirmed')
      return connection.getMinimumBalanceForRentExemption(eventDataLen)
    },
    enabled: eventDataLen > 0,
    staleTime: Infinity,
  })

  // Compute withdrawable balance per event (lamports above rent-exempt minimum)
  const getWithdrawable = (event: (typeof myEvents)[number]) => {
    if (rentExemptMin === 0) return 0
    return Math.max(0, event.lamports - rentExemptMin)
  }

  const eventsWithWithdrawable = useMemo(
    () => myEvents.filter((e) => getWithdrawable(e) > 0),
    [myEvents, rentExemptMin],
  )
  const eventsWithRevenue = myEvents.filter((e) => Number(e.totalRevenue) > 0)
  const totalRevenueLamports = myEvents.reduce((acc, e) => acc + Number(e.totalRevenue), 0)
  const totalSold = myEvents.reduce((acc, e) => acc + Number(e.totalMinted), 0)

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
    } else if (sendTransaction) {
      sig = await sendTransaction(tx, connection)
    } else {
      throw new Error('Wallet does not support transactions.')
    }
    await connection.confirmTransaction({ signature: sig, ...latestBlockhash }, 'confirmed')
    return sig
  }

  const handleWithdrawSingle = async (event: (typeof myEvents)[number]) => {
    if (!publicKey) { toast.error('Connect a wallet.'); return }
    setWithdrawingEvent(event.publicKey)
    try {
      const ix = withdrawRevenueInstruction(new PublicKey(event.authority), BigInt(event.id), null)
      const sig = await sendTx(ix)
      toast.success('Revenue withdrawn!', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-events'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Withdraw failed.', { description: err instanceof Error ? err.message : String(err) })
    } finally {
      setWithdrawingEvent(null)
    }
  }

  const handleWithdrawAll = async () => {
    if (!publicKey) { toast.error('Connect a wallet.'); return }
    if (eventsWithWithdrawable.length === 0) { toast.error('No events with withdrawable funds.'); return }
    setWithdrawingAll(true)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')
      const tx = new Transaction()
      for (const event of eventsWithWithdrawable) {
        tx.add(withdrawRevenueInstruction(new PublicKey(event.authority), BigInt(event.id), null))
      }
      tx.feePayer = publicKey
      const latestBlockhash = await connection.getLatestBlockhash()
      tx.recentBlockhash = latestBlockhash.blockhash
      let sig: string
      if (signTransaction) {
        const signedTx = await signTransaction(tx)
        sig = await connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: 'confirmed', skipPreflight: false, maxRetries: 3 })
      } else if (sendTransaction) {
        sig = await sendTransaction(tx, connection)
      } else {
        throw new Error('No signing method available.')
      }
      await connection.confirmTransaction({ signature: sig, ...latestBlockhash }, 'confirmed')
      toast.success('All revenue withdrawn!', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-events'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Withdraw failed.', { description: err instanceof Error ? err.message : String(err) })
    } finally {
      setWithdrawingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-display text-3xl text-white mb-2">Revenue</h1>
        <p className="text-white/40 text-sm">Track and withdraw ticket revenue from your on-chain event PDAs.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="font-display text-2xl text-brand-400">{lamportsToSol(totalRevenueLamports).toFixed(4)} SOL</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Total Tickets Sold</p>
          <p className="font-display text-2xl text-white">{totalSold.toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Events with Revenue</p>
          <p className="font-display text-2xl text-white">{eventsWithRevenue.length}</p>
        </div>
        <div className="glass rounded-xl p-5 flex flex-col justify-between">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Quick Action</p>
          <button
            onClick={handleWithdrawAll}
            disabled={withdrawingAll || eventsWithWithdrawable.length === 0 || !publicKey}
            className="btn-primary py-2 px-4 text-sm disabled:opacity-40 w-full"
          >
            {withdrawingAll ? 'Withdrawing...' : eventsWithWithdrawable.length > 0 ? 'Withdraw All' : 'Nothing to withdraw'}
          </button>
        </div>
      </div>

      {/* Per-Event Breakdown */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/08">
          <h2 className="font-display text-white">Per-Event Revenue</h2>
        </div>

        {isLoading && <div className="p-6 text-center text-white/40 text-sm">Loading events from devnet...</div>}

        {!isLoading && !publicKey && <div className="p-6 text-center text-white/40 text-sm">Connect a wallet to see your revenue.</div>}

        {!isLoading && publicKey && myEvents.length === 0 && (
          <div className="p-6 text-center text-white/40 text-sm">No events found. Create an event to start earning.</div>
        )}

        {!isLoading && myEvents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/08">
                  <th className="text-left px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Event</th>
                  <th className="text-right px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Tickets Sold</th>
                  <th className="text-right px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Revenue</th>
                  <th className="text-left px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => {
                  const revenue = Number(event.totalRevenue)
                  const withdrawable = getWithdrawable(event)
                  const canWithdraw = withdrawable > 0
                  return (
                    <tr key={event.publicKey} className="border-b border-white/05 hover:bg-white/03 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-white font-medium">{event.name}</p>
                        <p className="text-xs text-white/30 font-mono mt-0.5">{event.publicKey.slice(0, 16)}...</p>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-white/50">{Number(event.totalMinted)}</td>
                      <td className="px-5 py-3 text-right font-mono text-brand-400 font-semibold">
                        {lamportsToSol(revenue).toFixed(4)} SOL
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge text-[10px] ${event.isCancelled ? 'bg-red-500/20 text-red-400 border-red-500/30' : event.isActive ? 'badge-active' : 'bg-white/10 text-white/50 border-white/10'}`}>
                          {event.isCancelled ? 'Cancelled' : event.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleWithdrawSingle(event)}
                          disabled={!canWithdraw || withdrawingEvent === event.publicKey}
                          className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
                        >
                          {withdrawingEvent === event.publicKey ? 'Withdrawing...' : canWithdraw ? 'Withdraw' : 'Withdrawn'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-5 text-sm text-white/40">
        <p>Revenue is held in the on-chain Event PDA. Withdrawing transfers SOL from the event account to your connected wallet.</p>
        <p className="mt-1">Only the event authority (organizer) can withdraw funds.</p>
      </div>
    </div>
  )
}
