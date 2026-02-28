'use client'

import { use, useState } from 'react'
import { useTicketlyEvent } from '@/hooks/use-ticketly-events'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { addOperatorInstruction, removeOperatorInstruction } from '@/lib/ticketly/instructions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { useQueryClient } from '@tanstack/react-query'

export default function EventOperatorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const { data: event, isLoading, refetch } = useTicketlyEvent(id)
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const [operatorAddress, setOperatorAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingOp, setRemovingOp] = useState<string | null>(null)

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 rounded bg-white/5 animate-pulse" /></div>
  if (!event) return <div className="glass rounded-2xl p-12 text-center"><p className="text-white/50">Event not found.</p></div>

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

  const handleAdd = async () => {
    if (!publicKey) { toast.error('Connect a wallet.'); return }
    if (!operatorAddress) { toast.error('Enter an operator address.'); return }
    setIsSubmitting(true)
    try {
      const ix = addOperatorInstruction(new PublicKey(event.authority), BigInt(event.id), new PublicKey(operatorAddress))
      const sig = await sendTx(ix)
      toast.success('Operator added!', { description: sigDescription(sig) })
      setOperatorAddress('')
      await queryClient.invalidateQueries({ queryKey: ['ticketly-event'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add operator.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setIsSubmitting(false) }
  }

  const handleRemove = async (op: string) => {
    if (!publicKey) return
    setRemovingOp(op)
    try {
      const ix = removeOperatorInstruction(new PublicKey(event.authority), BigInt(event.id), new PublicKey(op))
      const sig = await sendTx(ix)
      toast.success('Operator removed!', { description: sigDescription(sig) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-event'] })
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setRemovingOp(null) }
  }

  // Get operators from on-chain event data
  const operators: string[] = [] // event.gateOperators would need to be in the TicketlyEvent type
  // For now we'll need to fetch from on-chain data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-display text-3xl text-white mb-2">Gate Operators — {event.name}</h1>
        <p className="text-white/40 text-sm">Manage wallets that can scan and validate tickets at the gate.</p>
      </header>

      {/* Add Operator */}
      <div className="glass-strong rounded-2xl p-5 neon-border max-w-xl space-y-4">
        <h3 className="font-display text-white">Add Operator</h3>
        <div className="space-y-2">
          <label className="text-xs text-white/60 uppercase tracking-wider">Wallet Address</label>
          <input type="text" value={operatorAddress} onChange={(e) => setOperatorAddress(e.target.value)} placeholder="Enter operator wallet address" className="input-field w-full font-mono text-sm" />
        </div>
        <button onClick={handleAdd} disabled={isSubmitting} className="btn-primary py-2 px-4 disabled:opacity-40">
          {isSubmitting ? 'Adding...' : 'Add Operator'}
        </button>
      </div>

      {/* Info */}
      <div className="glass rounded-2xl p-5 text-sm text-white/40">
        <p>Gate operators are stored on-chain in the event account. The event authority can always act as an operator.</p>
        <p className="mt-2">Use the Gate page (<span className="text-brand-400">/gate</span>) to check in tickets with your operator wallet.</p>
      </div>
    </div>
  )
}
