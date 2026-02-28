'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { initOrganizerInstruction, updateOrganizerInstruction } from '@/lib/ticketly/instructions'
import { findOrganizerAddress } from '@/lib/ticketly/pdas'
import { TicketlyCoder } from '@/lib/ticketly/ticketly-program'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'

export default function DashboardProfilePage() {
  const { publicKey, sendTransaction, signTransaction, connected } = useWallet()
  const { cluster } = useCluster()
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [logoUri, setLogoUri] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!publicKey) { setLoading(false); return }
    const load = async () => {
      try {
        const connection = new Connection(cluster.endpoint, 'confirmed')
        const [organizerPda] = findOrganizerAddress(publicKey)
        const info = await connection.getAccountInfo(organizerPda)
        if (info) {
          setHasProfile(true)
          const decoded = TicketlyCoder.accounts.decode('OrganizerProfile', Buffer.from(info.data)) as any
          setName(decoded.name || '')
          setWebsite(decoded.website || '')
          setLogoUri(decoded.logoUri || '')
        }
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [publicKey, cluster.endpoint])

  const handleSubmit = async () => {
    if (!publicKey || (!sendTransaction && !signTransaction)) { toast.error('Connect a wallet.'); return }
    if (!name.trim()) { toast.error('Name is required.'); return }
    setIsSubmitting(true)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')
      const params = { name: name.trim(), website: website.trim(), logoUri: logoUri.trim() }
      const ix = hasProfile ? updateOrganizerInstruction(publicKey, params) : initOrganizerInstruction(publicKey, params)
      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      const latestBlockhash = await connection.getLatestBlockhash()
      tx.recentBlockhash = latestBlockhash.blockhash
      let signature: string
      if (signTransaction) {
        const signedTx = await signTransaction(tx)
        signature = await connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: 'confirmed', skipPreflight: false, maxRetries: 3 })
      } else { signature = await sendTransaction!(tx, connection) }
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      setHasProfile(true)
      toast.success(hasProfile ? 'Profile updated!' : 'Profile created!', { description: sigDescription(signature) })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save profile.', { description: err instanceof Error ? err.message : String(err) })
    } finally { setIsSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-display text-3xl text-white mb-2">Organizer Profile</h1>
        <p className="text-white/40 text-sm">{hasProfile ? 'Update your on-chain organizer profile.' : 'Create your on-chain organizer profile to start hosting events.'}</p>
      </header>
      {loading ? (
        <div className="glass rounded-2xl p-8 animate-pulse"><div className="h-40 bg-white/5 rounded-xl" /></div>
      ) : !connected ? (
        <div className="glass rounded-2xl p-12 text-center"><p className="text-white/50">Connect a wallet to manage your profile.</p></div>
      ) : (
        <div className="glass-strong rounded-2xl p-6 neon-border max-w-xl space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Display Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your organizer name" className="input-field w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://your-website.com" className="input-field w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Logo URL</label>
              <input type="url" value={logoUri} onChange={(e) => setLogoUri(e.target.value)} placeholder="https://example.com/logo.png" className="input-field w-full" />
            </div>
          </div>
          {publicKey && (
            <div className="glass rounded-xl p-3 text-xs text-white/40">
              <p>Wallet: <span className="font-mono text-white/60">{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}</span></p>
              <p>Status: <span className={hasProfile ? 'text-neon-green' : 'text-amber-400'}>{hasProfile ? 'Profile exists on-chain' : 'No profile yet'}</span></p>
            </div>
          )}
          <button onClick={handleSubmit} disabled={isSubmitting || !name.trim()} className="btn-primary w-full py-3 disabled:opacity-40">
            {isSubmitting ? 'Submitting...' : hasProfile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      )}
    </div>
  )
}
