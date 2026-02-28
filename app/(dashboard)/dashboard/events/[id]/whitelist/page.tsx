'use client'

import { use, useState } from 'react'
import { useTicketlyEvent } from '@/hooks/use-ticketly-events'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { addWhitelistEntryInstruction, removeWhitelistEntryInstruction } from '@/lib/ticketly/instructions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'

export default function EventWhitelistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: event, isLoading } = useTicketlyEvent(id)
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const [walletAddress, setWalletAddress] = useState('')
  const [allocation, setAllocation] = useState(1)
  const [bulkInput, setBulkInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBulk, setShowBulk] = useState(false)

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
    if (!walletAddress) { toast.error('Enter a wallet address.'); return }
    setIsSubmitting(true)
    try {
      const ix = addWhitelistEntryInstruction(new PublicKey(event.authority), BigInt(event.id), new PublicKey(walletAddress), allocation)
      const sig = await sendTx(ix)
      toast.success('Whitelist entry added!', { description: sigDescription(sig) })
      setWalletAddress('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to add.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setIsSubmitting(false) }
  }

  const handleBulkAdd = async () => {
    if (!publicKey) { toast.error('Connect a wallet.'); return }
    const lines = bulkInput.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) { toast.error('Enter wallet addresses.'); return }
    setIsSubmitting(true)
    let success = 0
    for (const line of lines) {
      try {
        const [addr, alloc] = line.split(',').map((s) => s.trim())
        const wallet = new PublicKey(addr)
        const a = parseInt(alloc) || allocation
        const ix = addWhitelistEntryInstruction(new PublicKey(event.authority), BigInt(event.id), wallet, a)
        await sendTx(ix)
        success++
      } catch (err) {
        console.error(`Failed for ${line}:`, err)
      }
    }
    toast.success(`Added ${success}/${lines.length} entries.`)
    setBulkInput('')
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-display text-3xl text-white mb-2">Whitelist — {event.name}</h1>
        <p className="text-white/40 text-sm">Manage addresses allowed to purchase tickets.</p>
        <p className="text-xs text-white/30 mt-1">Whitelist gated: <span className={event.whitelistGated ? 'text-neon-green' : 'text-white/50'}>{event.whitelistGated ? 'Yes' : 'No'}</span></p>
      </header>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowBulk(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!showBulk ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : 'glass border border-white/08 text-white/50'}`}>Single Add</button>
        <button onClick={() => setShowBulk(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showBulk ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : 'glass border border-white/08 text-white/50'}`}>Bulk Import</button>
      </div>

      {!showBulk ? (
        <div className="glass-strong rounded-2xl p-5 neon-border max-w-xl space-y-4">
          <h3 className="font-display text-white">Add Wallet</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/60 uppercase tracking-wider">Wallet Address</label>
              <input type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="Enter wallet address" className="input-field w-full font-mono text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60 uppercase tracking-wider">Max Tickets</label>
              <input type="number" min={1} max={255} value={allocation} onChange={(e) => setAllocation(Number(e.target.value) || 1)} className="input-field w-24" />
            </div>
          </div>
          <button onClick={handleAdd} disabled={isSubmitting} className="btn-primary py-2 px-4 disabled:opacity-40">
            {isSubmitting ? 'Adding...' : 'Add to Whitelist'}
          </button>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-5 neon-border max-w-xl space-y-4">
          <h3 className="font-display text-white">Bulk Import</h3>
          <p className="text-xs text-white/40">One wallet per line. Optionally add allocation: <span className="font-mono text-white/60">address,allocation</span></p>
          <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} rows={6} placeholder="wallet1address&#10;wallet2address,3&#10;wallet3address,5" className="input-field w-full font-mono text-xs resize-none" />
          <button onClick={handleBulkAdd} disabled={isSubmitting} className="btn-primary py-2 px-4 disabled:opacity-40">
            {isSubmitting ? 'Processing...' : 'Import All'}
          </button>
        </div>
      )}
    </div>
  )
}
