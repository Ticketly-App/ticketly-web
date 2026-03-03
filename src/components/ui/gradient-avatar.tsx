'use client'

/**
 * Vercel-style deterministic gradient avatar.
 * Generates a unique, colorful gradient based on a seed string (address, name, etc).
 */

const GRADIENT_PAIRS = [
  ['#f97316', '#ec4899'],  // orange → pink
  ['#8b5cf6', '#06b6d4'],  // violet → cyan
  ['#ef4444', '#f59e0b'],  // red → amber
  ['#10b981', '#3b82f6'],  // emerald → blue
  ['#f43f5e', '#a855f7'],  // rose → purple
  ['#14b8a6', '#8b5cf6'],  // teal → violet
  ['#f59e0b', '#ef4444'],  // amber → red
  ['#6366f1', '#ec4899'],  // indigo → pink
  ['#06b6d4', '#10b981'],  // cyan → emerald
  ['#d946ef', '#f97316'],  // fuchsia → orange
  ['#3b82f6', '#8b5cf6'],  // blue → violet
  ['#ec4899', '#f59e0b'],  // pink → amber
  ['#a855f7', '#06b6d4'],  // purple → cyan
  ['#22c55e', '#eab308'],  // green → yellow
  ['#e11d48', '#7c3aed'],  // rose → violet
  ['#0ea5e9', '#f43f5e'],  // sky → rose
]

function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function getGradient(seed: string): { from: string; to: string; angle: number } {
  const hash = hashSeed(seed)
  const pair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length]
  const angle = (hash % 360)
  return { from: pair[0], to: pair[1], angle }
}

interface GradientAvatarProps {
  seed: string
  /** Optional initial letter to show on top of the gradient */
  name?: string
  /** Size in px — sets both width and height */
  size?: number
  /** Border radius class (default: 'rounded-full') */
  rounded?: string
  /** Extra classes */
  className?: string
  /** Font size class for the initial (auto-calculated if not provided) */
  fontSize?: string
}

export function GradientAvatar({
  seed,
  name,
  size = 20,
  rounded = 'rounded-full',
  className = '',
  fontSize,
}: GradientAvatarProps) {
  const { from, to, angle } = getGradient(seed)
  return (
    <div
      className={`${rounded} flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(${angle}deg, ${from}, ${to})`,
      }}
    />
  )
}
