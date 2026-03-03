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
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useXProfile } from '@/components/auth/XAuthGate'
import { GradientAvatar } from '@/components/ui/gradient-avatar'
import { signIn } from 'next-auth/react'
import { extractXHandle } from '@/hooks/use-organizer-profiles'

export default function DashboardProfilePage() {
  const { publicKey, sendTransaction, signTransaction, connected } = useWallet()
  const { cluster } = useCluster()
  const { isAuthenticated: xAuth, name: xName, handle: xHandle, image: xImage } = useXProfile()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [logoUri, setLogoUri] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [prefilled, setPrefilled] = useState(false)

  // Load existing on-chain profile
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
          // Clean the website field to extract X handle if possible
          const cleanHandle = extractXHandle(decoded.website)
          setUsername(cleanHandle ? `@${cleanHandle}` : decoded.website || '')
          setLogoUri(decoded.logoUri || '')
          setPrefilled(true)
        }
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [publicKey, cluster.endpoint])

  // Auto-fill from X profile for both new & existing profiles
  useEffect(() => {
    if (!xAuth || !xHandle || prefilled) return
    // For new profiles: auto-fill all fields from X session data
    if (!hasProfile && !loading) {
      if (xName && !name) setName(xName)
      if (xHandle && !username) setUsername(`@${xHandle}`)
      if (xImage && !logoUri) setLogoUri(xImage)
      setPrefilled(true)
      return
    }
    // For existing profiles: auto-fill username if it looks like a URL (not an X handle)
    if (hasProfile) {
      const currentHandle = extractXHandle(username)
      if (!currentHandle && xHandle) setUsername(`@${xHandle}`)
    }
  }, [xAuth, xHandle, xName, xImage, hasProfile, loading, prefilled])

  const handleSubmit = async () => {
    if (!publicKey || (!sendTransaction && !signTransaction)) { toast.error('Connect a wallet.'); return }
    if (!name.trim()) { toast.error('Name is required.'); return }
    setIsSubmitting(true)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')
      // Store clean handle in the on-chain website field (strip @ prefix)
      const cleanUsername = username.trim().replace(/^@/, '')
      const params = { name: name.trim(), website: cleanUsername, logoUri: logoUri.trim() }
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
          {/* Not connected to X: show connect button */}
          {!xAuth && (
            <button
              onClick={() => signIn('twitter', { callbackUrl: '/dashboard/profile' })}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] p-6 text-center space-y-4 transition-all group cursor-pointer"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center group-hover:bg-brand-600/20 transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-brand-400" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg text-white mb-1 group-hover:text-brand-400 transition-colors">Connect your X account</h3>
                <p className="text-sm text-white/35 leading-relaxed">Click to verify your X (Twitter) account. Your profile will be auto-filled.</p>
              </div>
            </button>
          )}

          {/* X linked indicator — auto-filled */}
          {xAuth && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-emerald-500/[0.06] border border-emerald-500/[0.15]">
              {xImage ? <img src={xImage} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30" /> : <GradientAvatar seed={xHandle || 'user'} name={xName || xHandle || 'U'} size={32} className="ring-2 ring-emerald-500/30" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-400 font-medium">X account verified — profile auto-filled</p>
                <p className="text-[11px] text-white/40 truncate">@{xHandle} &middot; {xName}</p>
              </div>
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Display Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your organizer name" className="input-field w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">X Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" className="input-field w-full pl-9" />
              </div>
            </div>
            <ImageUpload value={logoUri} onChange={setLogoUri} label="Profile Logo" />
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
