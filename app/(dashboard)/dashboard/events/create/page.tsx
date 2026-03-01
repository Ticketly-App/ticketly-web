'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { initOrganizerInstruction, createEventInstruction } from '@/lib/ticketly/instructions'
import { findEventAddress, findOrganizerAddress } from '@/lib/ticketly/pdas'
import type { CreateEventParams, InitOrganizerParams, TicketTier } from '@/lib/ticketly/types'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ImageUpload } from '@/components/ui/ImageUpload'

const CATEGORIES = ['Music', 'Sports', 'Conference', 'Theatre', 'Art', 'Gaming', 'Food', 'Other']
const TIER_PRESETS = [
  { label: 'General Admission', type: 0 },
  { label: 'Early Bird', type: 1 },
  { label: 'VIP', type: 2 },
  { label: 'VVIP', type: 3 },
  { label: 'Custom', type: 4 },
]

interface TierDraft {
  id: number
  tierType: number
  label: string
  priceSol: string
  supply: string
  isOnSale: boolean
}

const STEPS = ['Basic Info', 'Date & Venue', 'Tickets', 'Advanced'] as const
type Step = (typeof STEPS)[number]

export default function CreateEventPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const [step, setStep] = useState<Step>('Basic Info')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Basic Info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Step 2: Date & Venue
  const [venue, setVenue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Step 3: Tickets
  const [tiers, setTiers] = useState<TierDraft[]>([
    { id: 1, tierType: 0, label: 'General Admission', priceSol: '0.1', supply: '100', isOnSale: true },
  ])

  // Step 4: Advanced
  const [resaleAllowed, setResaleAllowed] = useState(true)
  const [maxResaleMultiple, setMaxResaleMultiple] = useState('2')
  const [royaltyBps, setRoyaltyBps] = useState('500')
  const [whitelistGated, setWhitelistGated] = useState(false)
  const [poapEnabled, setPoapEnabled] = useState(false)

  const stepIndex = STEPS.indexOf(step)
  const isLastStep = stepIndex === STEPS.length - 1

  const addTier = () => {
    const nextId = Math.max(...tiers.map((t) => t.id), 0) + 1
    setTiers([...tiers, { id: nextId, tierType: 0, label: 'General Admission', priceSol: '0.1', supply: '50', isOnSale: true }])
  }

  const removeTier = (id: number) => {
    if (tiers.length <= 1) return
    setTiers(tiers.filter((t) => t.id !== id))
  }

  const updateTier = (id: number, field: keyof TierDraft, value: any) => {
    setTiers(tiers.map((t) => {
      if (t.id !== id) return t
      if (field === 'tierType') {
        return { ...t, tierType: value, label: TIER_PRESETS.find((p) => p.type === value)?.label || `Tier ${value}` }
      }
      return { ...t, [field]: value }
    }))
  }

  const validateStep = (): boolean => {
    switch (step) {
      case 'Basic Info':
        if (!name.trim()) { toast.error('Enter an event name.'); return false }
        if (!category) { toast.error('Select a category.'); return false }
        return true
      case 'Date & Venue':
        if (!venue.trim()) { toast.error('Enter a venue.'); return false }
        if (!startDate) { toast.error('Set a start date.'); return false }
        if (new Date(startDate).getTime() <= Date.now()) { toast.error('Start date must be in the future.'); return false }
        return true
      case 'Tickets':
        for (const tier of tiers) {
          if (parseFloat(tier.priceSol) < 0) { toast.error('Price cannot be negative.'); return false }
          if (parseInt(tier.supply) < 1) { toast.error('Supply must be at least 1.'); return false }
        }
        return true
      case 'Advanced':
        return true
    }
  }

  const goNext = () => {
    if (!validateStep()) return
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1])
  }

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1])
  }

  const handleSubmit = async () => {
    if (!publicKey || (!sendTransaction && !signTransaction)) {
      toast.error('Connect a wallet to create an event.')
      return
    }
    if (!validateStep()) return

    setIsSubmitting(true)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')
      const authority = publicKey

      const eventId = BigInt(Date.now())
      const eventStartMs = new Date(startDate).getTime()
      const eventEndMs = endDate ? new Date(endDate).getTime() : eventStartMs + 2 * 60 * 60 * 1000
      const eventStartSec = Math.floor(eventStartMs / 1000)
      const eventEndSec = Math.floor(eventEndMs / 1000)
      const nowSec = Math.floor(Date.now() / 1000)

      const ticketTiers: TicketTier[] = tiers.map((t) => {
        const priceLamports = BigInt(Math.floor(parseFloat(t.priceSol) * 1_000_000_000))
        return {
          tierType: t.tierType,
          price: priceLamports,
          supply: parseInt(t.supply) || 1,
          minted: 0,
          checkedIn: 0,
          isOnSale: t.isOnSale,
          saleStart: 0n,  // 0 = no start restriction, tickets on sale immediately
          saleEnd: 0n,    // 0 = no end restriction, sale closes when event is cancelled/deactivated
        }
      })

      const firstPrice = ticketTiers[0]?.price || 1_000_000_000n
      const metadataUri = imageUrl || `https://ticketly.dev/metadata/event/${eventId.toString()}`
      const symbol = category ? category.toUpperCase().slice(0, 10) : 'TICKET'

      const createParams: CreateEventParams = {
        eventId,
        name: name.trim(),
        description: description.trim() || `${name} at ${venue}`,
        venue: venue.trim(),
        metadataUri,
        symbol,
        gps: { latMicro: 0, lngMicro: 0 },
        eventStart: BigInt(eventStartSec),
        eventEnd: BigInt(eventEndSec),
        ticketTiers,
        resaleAllowed,
        maxResalePrice: resaleAllowed ? firstPrice * BigInt(parseInt(maxResaleMultiple) || 2) : null,
        royaltyBps: parseInt(royaltyBps) || 500,
        whitelistGated,
        poapEnabled,
        poapMetadataUri: poapEnabled ? `https://ticketly.dev/metadata/poap/${eventId.toString()}` : '',
      }

      const [organizerPda] = findOrganizerAddress(authority)
      const organizerInfo = await connection.getAccountInfo(organizerPda)

      const instructions = []
      if (!organizerInfo) {
        const organizerParams: InitOrganizerParams = {
          name: name.trim().slice(0, 50),
          website: 'https://ticketly.dev',
          logoUri: metadataUri,
        }
        instructions.push(initOrganizerInstruction(authority, organizerParams))
      }
      instructions.push(createEventInstruction(authority, createParams))

      const tx = new Transaction().add(...instructions)
      tx.feePayer = authority
      const latestBlockhash = await connection.getLatestBlockhash()
      tx.recentBlockhash = latestBlockhash.blockhash

      const simulation = await connection.simulateTransaction(tx)
      if (simulation.value.err) {
        const logs = simulation.value.logs?.join('\n')
        throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}${logs ? `\n${logs}` : ''}`)
      }

      let signature: string
      if (signTransaction) {
        const signedTx = await signTransaction(tx)
        signature = await connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: 'confirmed', skipPreflight: false, maxRetries: 3 })
      } else if (sendTransaction) {
        signature = await sendTransaction(tx, connection)
      } else {
        throw new Error('Wallet does not support transaction submission.')
      }

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

      const [eventPda] = findEventAddress(authority, eventId)

      // Sync to MongoDB (await so data is persisted before redirect)
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pubkey: eventPda.toBase58(),
            organizer: name.trim(),
            organizerWallet: authority.toBase58(),
            eventId: Number(eventId),
            name: name.trim(),
            description: createParams.description,
            imageUri: metadataUri,
            startTime: new Date(eventStartMs).toISOString(),
            endTime: new Date(eventEndMs).toISOString(),
            venue: venue.trim(),
            location: { lat: 0, lng: 0 },
            categories: category ? [category] : [],
            tiers: tiers.map((t, i) => ({
              id: i,
              name: t.label,
              description: `${t.label} ticket`,
              price: Math.floor(parseFloat(t.priceSol) * 1_000_000_000),
              supply: parseInt(t.supply),
              sold: 0,
              tierType: TIER_PRESETS.find((p) => p.type === t.tierType)?.label || 'General',
              transferable: true,
              maxPerWallet: parseInt(t.supply),
            })),
            totalTicketsSold: 0,
            totalRevenue: 0,
            totalCheckins: 0,
            whitelistEnabled: whitelistGated,
            poapEnabled,
            resaleEnabled: resaleAllowed,
            maxResalePercent: parseInt(maxResaleMultiple) * 100,
            status: 'Active',
          }),
        })
      } catch (dbErr) {
        console.error('Failed to persist to MongoDB', dbErr)
      }

      toast.success('Event created on devnet!', { description: sigDescription(signature) })
      await queryClient.invalidateQueries({ queryKey: ['ticketly-events'] })
      router.push(`/dashboard/events/${eventPda.toBase58()}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create event.', { description: err instanceof Error ? err.message : String(err) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="heading-display text-3xl text-white mb-2">Create Event</h1>
        <p className="text-white/40 text-sm">Configure and deploy your on-chain event to Solana devnet.</p>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const isActive = i === stepIndex
          const isDone = i < stepIndex
          return (
            <div key={s} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => { if (i < stepIndex) setStep(STEPS[i]) }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all w-full
                  ${isActive ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : isDone ? 'glass text-neon-green border border-neon-green/20' : 'glass text-white/30 border border-white/05'}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${isActive ? 'bg-brand-600 text-white' : isDone ? 'bg-neon-green/20 text-neon-green' : 'bg-white/10 text-white/30'}`}>
                  {isDone ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`h-px w-4 flex-shrink-0 ${isDone ? 'bg-neon-green/30' : 'bg-white/10'}`} />}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="glass-strong rounded-2xl p-6 neon-border space-y-5">
        {step === 'Basic Info' && (
          <>
            <h3 className="font-display text-white text-lg">Basic Information</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/60 uppercase tracking-wider">Event Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Solana Summit 2026" className="input-field w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/60 uppercase tracking-wider">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell attendees what to expect..." className="input-field w-full resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/60 uppercase tracking-wider">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full">
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <ImageUpload value={imageUrl} onChange={setImageUrl} label="Event Image" />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'Date & Venue' && (
          <>
            <h3 className="font-display text-white text-lg">Date & Venue</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/60 uppercase tracking-wider">Venue *</label>
                <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Lisbon Convention Center" className="input-field w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/60 uppercase tracking-wider">Start Date & Time *</label>
                  <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60 uppercase tracking-wider">End Date & Time</label>
                  <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field w-full" />
                  <p className="text-[10px] text-white/30 mt-0.5">Leave empty for default +2 hours</p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'Tickets' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-white text-lg">Ticket Tiers</h3>
              <button onClick={addTier} className="btn-secondary py-1.5 px-3 text-xs">+ Add Tier</button>
            </div>
            <div className="space-y-4">
              {tiers.map((tier, idx) => (
                <div key={tier.id} className="glass rounded-xl p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 font-mono">Tier {idx + 1}</span>
                    {tiers.length > 1 && (
                      <button onClick={() => removeTier(tier.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Type</label>
                      <select value={tier.tierType} onChange={(e) => updateTier(tier.id, 'tierType', parseInt(e.target.value))} className="input-field w-full text-sm">
                        {TIER_PRESETS.map((p) => <option key={p.type} value={p.type}>{p.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Label</label>
                      <input type="text" value={tier.label} onChange={(e) => updateTier(tier.id, 'label', e.target.value)} className="input-field w-full text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Price (SOL)</label>
                      <input type="number" step="0.001" min="0" value={tier.priceSol} onChange={(e) => updateTier(tier.id, 'priceSol', e.target.value)} className="input-field w-full text-sm font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Supply</label>
                      <input type="number" min="1" value={tier.supply} onChange={(e) => updateTier(tier.id, 'supply', e.target.value)} className="input-field w-full text-sm font-mono" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                    <input type="checkbox" checked={tier.isOnSale} onChange={(e) => updateTier(tier.id, 'isOnSale', e.target.checked)} className="rounded border-white/20 bg-white/05 text-brand-500" />
                    Start sales immediately
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'Advanced' && (
          <>
            <h3 className="font-display text-white text-lg">Advanced Settings</h3>
            <div className="space-y-5">
              {/* Resale */}
              <div className="glass rounded-xl p-4 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-white">Allow Resale</p>
                    <p className="text-xs text-white/40">Let ticket holders list tickets on the marketplace.</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full flex items-center transition-colors cursor-pointer ${resaleAllowed ? 'bg-brand-600 justify-end' : 'bg-white/10 justify-start'}`} onClick={() => setResaleAllowed(!resaleAllowed)}>
                    <div className="w-4 h-4 rounded-full bg-white mx-0.5" />
                  </div>
                </label>
                {resaleAllowed && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Max Resale Multiplier</label>
                      <input type="number" min="1" max="10" step="0.5" value={maxResaleMultiple} onChange={(e) => setMaxResaleMultiple(e.target.value)} className="input-field w-full text-sm font-mono" />
                      <p className="text-[10px] text-white/30">e.g. 2 = max 2x original price</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase">Royalty (bps)</label>
                      <input type="number" min="0" max="5000" step="100" value={royaltyBps} onChange={(e) => setRoyaltyBps(e.target.value)} className="input-field w-full text-sm font-mono" />
                      <p className="text-[10px] text-white/30">{parseInt(royaltyBps) / 100}% on secondary sales</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Whitelist */}
              <div className="glass rounded-xl p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-white">Whitelist Gated</p>
                    <p className="text-xs text-white/40">Restrict minting to whitelisted wallets only.</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full flex items-center transition-colors cursor-pointer ${whitelistGated ? 'bg-brand-600 justify-end' : 'bg-white/10 justify-start'}`} onClick={() => setWhitelistGated(!whitelistGated)}>
                    <div className="w-4 h-4 rounded-full bg-white mx-0.5" />
                  </div>
                </label>
              </div>

              {/* POAP */}
              <div className="glass rounded-xl p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-white">POAP Enabled</p>
                    <p className="text-xs text-white/40">Issue proof-of-attendance NFTs after check-in.</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full flex items-center transition-colors cursor-pointer ${poapEnabled ? 'bg-brand-600 justify-end' : 'bg-white/10 justify-start'}`} onClick={() => setPoapEnabled(!poapEnabled)}>
                    <div className="w-4 h-4 rounded-full bg-white mx-0.5" />
                  </div>
                </label>
              </div>

              {/* Review Summary */}
              <div className="glass rounded-xl p-4 space-y-2">
                <p className="text-xs text-white/50 uppercase tracking-wider">Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-white/40">Event:</span> <span className="text-white">{name || '—'}</span></div>
                  <div><span className="text-white/40">Venue:</span> <span className="text-white">{venue || '—'}</span></div>
                  <div><span className="text-white/40">Category:</span> <span className="text-white">{category || '—'}</span></div>
                  <div><span className="text-white/40">Tiers:</span> <span className="text-white">{tiers.length}</span></div>
                  <div><span className="text-white/40">Total Supply:</span> <span className="text-white">{tiers.reduce((s, t) => s + (parseInt(t.supply) || 0), 0)}</span></div>
                  <div><span className="text-white/40">Resale:</span> <span className="text-white">{resaleAllowed ? 'Yes' : 'No'}</span></div>
                  <div><span className="text-white/40">Whitelist:</span> <span className="text-white">{whitelistGated ? 'Yes' : 'No'}</span></div>
                  <div><span className="text-white/40">POAP:</span> <span className="text-white">{poapEnabled ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goBack} disabled={stepIndex === 0} className="btn-secondary py-2.5 px-5 disabled:opacity-30 disabled:cursor-not-allowed">
          Back
        </button>
        <div className="flex gap-3">
          {!isLastStep ? (
            <button onClick={goNext} className="btn-primary py-2.5 px-6">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting || !publicKey} className="btn-primary py-2.5 px-6 disabled:opacity-40">
              {isSubmitting ? 'Creating...' : 'Create Event on Devnet'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
