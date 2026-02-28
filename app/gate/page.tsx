'use client'

import { useState, type ReactNode } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { checkInTicketInstruction } from '@/lib/ticketly/instructions'
import { fetchEventAccount, fetchTicketAccount, lamportsToSol } from '@/lib/ticketly/ticketly-query'
import { findTicketMintAddress } from '@/lib/ticketly/pdas'
import { toast } from 'sonner'
import { sigDescription } from '@/components/use-transaction-toast'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

const PROGRAM_ERROR_MAP: Record<number, string> = {
  6011: 'This event is not currently active.',
  6012: 'This event has already ended.',
  6013: 'Check-in is not open yet — it opens 1 hour before the event starts.',
  6014: 'This event has been cancelled.',
  6021: 'This ticket has already been checked in.',
  6023: 'This ticket does not belong to the specified event.',
  6024: 'The attendee no longer owns this ticket.',
  6025: 'This ticket is listed for resale — the attendee must cancel the listing first.',
  6027: 'Token mint mismatch — the ticket NFT does not match.',
  6028: 'The attendee\'s wallet no longer holds this ticket token.',
  6029: 'Token account owner mismatch.',
  6041: 'Your wallet is not an authorized gate operator for this event.',
}

function parseOnChainError(err: unknown): string | null {
  const msg = err instanceof Error ? err.message : String(err)
  const codeMatch = msg.match(/custom program error: 0x([0-9a-fA-F]+)/)
  if (codeMatch) {
    const code = parseInt(codeMatch[1], 16)
    return PROGRAM_ERROR_MAP[code] ?? `Transaction failed (program error ${code}).`
  }
  if (msg.includes('User rejected')) return 'Transaction was cancelled by the wallet.'
  return null
}

type CheckInResult = {
  status: 'valid' | 'invalid' | 'already_used' | 'error'
  message: string
  sigLink?: ReactNode
  ticketInfo?: { ticketNumber: string; tierType: string; owner: string; eventName: string }
}

export default function GatePage() {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { cluster } = useCluster()
  const [ticketPubkey, setTicketPubkey] = useState('')
  const [eventPubkey, setEventPubkey] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [isOperator, setIsOperator] = useState<boolean | null>(null)

  const verifyAndCheckIn = async () => {
    if (!publicKey || (!sendTransaction && !signTransaction)) {
      toast.error('Connect your operator wallet.')
      return
    }
    if (!ticketPubkey || !eventPubkey) {
      toast.error('Enter both ticket and event addresses.')
      return
    }

    setIsChecking(true)
    setLastResult(null)
    try {
      const connection = new Connection(cluster.endpoint, 'confirmed')

      const [eventAccount, ticketAccount] = await Promise.all([
        fetchEventAccount(cluster.endpoint, eventPubkey),
        fetchTicketAccount(cluster.endpoint, ticketPubkey),
      ])

      if (!eventAccount) {
        setLastResult({ status: 'invalid', message: 'Event not found on-chain.' })
        return
      }
      if (!ticketAccount) {
        setLastResult({ status: 'invalid', message: 'Ticket not found on-chain.' })
        return
      }

      // Verify operator
      const operators = eventAccount.gateOperators.map((op: PublicKey) => op.toBase58())
      const authorityKey = eventAccount.authority.toBase58()
      const isOp = operators.includes(publicKey.toBase58()) || publicKey.toBase58() === authorityKey
      setIsOperator(isOp)
      if (!isOp) {
        setLastResult({ status: 'error', message: 'Your wallet is not a gate operator for this event.' })
        return
      }

      if (ticketAccount.isCheckedIn) {
        setLastResult({
          status: 'already_used',
          message: 'This ticket has already been checked in.',
          ticketInfo: {
            ticketNumber: ticketAccount.ticketNumber.toString(),
            tierType: ticketAccount.tierType.toString(),
            owner: ticketAccount.owner.toBase58(),
            eventName: eventAccount.name,
          },
        })
        return
      }

      // Verify ticket belongs to event
      if (ticketAccount.event.toBase58() !== eventPubkey) {
        setLastResult({ status: 'invalid', message: 'Ticket does not belong to this event.' })
        return
      }

      // Build check-in tx
      const mint = ticketAccount.mint
      const attendee = ticketAccount.owner

      const ix = checkInTicketInstruction(
        new PublicKey(eventPubkey),
        new PublicKey(ticketPubkey),
        mint,
        attendee,
        publicKey,
        TOKEN_METADATA_PROGRAM,
      )

      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      const latestBlockhash = await connection.getLatestBlockhash()
      tx.recentBlockhash = latestBlockhash.blockhash

      let signature: string
      if (signTransaction) {
        const signedTx = await signTransaction(tx)
        signature = await connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: 'confirmed', skipPreflight: false, maxRetries: 3 })
      } else {
        signature = await sendTransaction!(tx, connection)
      }

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

      setSessionCount((c) => c + 1)
      setLastResult({
        status: 'valid',
        message: `Check-in successful!`,
        sigLink: sigDescription(signature),
        ticketInfo: {
          ticketNumber: ticketAccount.ticketNumber.toString(),
          tierType: ticketAccount.tierType.toString(),
          owner: ticketAccount.owner.toBase58(),
          eventName: eventAccount.name,
        },
      })
      toast.success('Ticket checked in!')
      setTicketPubkey('')
    } catch (error) {
      console.error(error)
      const friendly = parseOnChainError(error)
      const message = friendly ?? (error instanceof Error ? error.message : String(error))
      setLastResult({ status: 'error', message })
      toast.error(friendly ?? 'Check-in failed.')
    } finally {
      setIsChecking(false)
    }
  }

  const statusColors = {
    valid: 'from-neon-green/20 to-neon-green/5 border-neon-green/40',
    invalid: 'from-red-500/20 to-red-500/5 border-red-500/40',
    already_used: 'from-amber-500/20 to-amber-500/5 border-amber-500/40',
    error: 'from-red-500/20 to-red-500/5 border-red-500/40',
  }

  const statusIcons = {
    valid: '&#10003;',
    invalid: '&#10007;',
    already_used: '!',
    error: '&#10007;',
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="badge badge-active mb-4">Gate Scanner</div>
            <h1 className="heading-display text-4xl md:text-5xl text-white mb-3">Check-In <span className="gradient-text">Gate</span></h1>
            <p className="text-white/40">Verify and check in tickets on-chain. Requires gate operator wallet.</p>
          </div>

          {/* Session Stats */}
          <div className="glass rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-400"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div>
                <p className="text-xs text-white/40">Session Check-ins</p>
                <p className="font-display font-bold text-white text-xl">{sessionCount}</p>
              </div>
            </div>
            {isOperator !== null && (
              <span className={`badge ${isOperator ? 'badge-active' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {isOperator ? 'Operator Verified' : 'Not Operator'}
              </span>
            )}
          </div>

          {/* Input Form */}
          <div className="glass-strong rounded-2xl p-6 neon-border space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Event Address</label>
              <input
                type="text"
                placeholder="Paste event pubkey..."
                value={eventPubkey}
                onChange={(e) => setEventPubkey(e.target.value)}
                className="input-field w-full font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Ticket Address</label>
              <input
                type="text"
                placeholder="Paste ticket pubkey or scan QR..."
                value={ticketPubkey}
                onChange={(e) => setTicketPubkey(e.target.value)}
                className="input-field w-full font-mono text-sm"
              />
            </div>
            <button
              onClick={verifyAndCheckIn}
              disabled={isChecking || !publicKey || !ticketPubkey || !eventPubkey}
              className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Verifying...
                </span>
              ) : !publicKey ? 'Connect Operator Wallet' : 'Verify & Check In'}
            </button>
          </div>

          {/* Result */}
          {lastResult && (
            <div className={`rounded-2xl border p-6 bg-gradient-to-br ${statusColors[lastResult.status]} space-y-3`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${lastResult.status === 'valid' ? 'bg-neon-green/20 text-neon-green' : lastResult.status === 'already_used' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {lastResult.status === 'valid' ? '\u2713' : lastResult.status === 'already_used' ? '!' : '\u2717'}
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">
                    {lastResult.status === 'valid' ? 'Valid - Checked In' : lastResult.status === 'already_used' ? 'Already Used' : lastResult.status === 'invalid' ? 'Invalid Ticket' : 'Error'}
                  </h3>
                  <p className="text-sm text-white/60">{lastResult.message}</p>
                  {lastResult.sigLink && <p className="text-sm text-white/60">{lastResult.sigLink}</p>}
                </div>
              </div>
              {lastResult.ticketInfo && (
                <div className="glass rounded-xl p-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-white/40">Event</span><span className="text-white">{lastResult.ticketInfo.eventName}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Ticket #</span><span className="text-white font-mono">{lastResult.ticketInfo.ticketNumber}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Owner</span><span className="text-white font-mono text-xs">{lastResult.ticketInfo.owner.slice(0, 8)}...{lastResult.ticketInfo.owner.slice(-8)}</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
