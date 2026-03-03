'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyAddressProps {
  address: string
  /** Number of chars to show at start and end (default: 4) */
  chars?: number
  className?: string
  /** Additional classes for the text */
  textClassName?: string
  /** Icon size in px (default: 12) */
  iconSize?: number
}

/**
 * Renders a sliced pubkey (start...end) with an inline copy button.
 * Click anywhere on the chip to copy.
 */
export function CopyAddress({
  address,
  chars = 4,
  className = '',
  textClassName = '',
  iconSize = 12,
}: CopyAddressProps) {
  const [copied, setCopied] = useState(false)

  const short = address.length > chars * 2 + 3
    ? `${address.slice(0, chars)}...${address.slice(-chars)}`
    : address

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 font-mono hover:text-white/60 transition-colors cursor-pointer ${className}`}
      title={copied ? 'Copied!' : address}
    >
      <span className={textClassName}>
        {copied ? 'Copied!' : short}
      </span>
      {copied ? (
        <Check className="flex-shrink-0 text-emerald-400" style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Copy className="flex-shrink-0 opacity-40 hover:opacity-80" style={{ width: iconSize, height: iconSize }} />
      )}
    </button>
  )
}
