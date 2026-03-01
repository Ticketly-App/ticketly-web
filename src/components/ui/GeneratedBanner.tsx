'use client'

// Deterministic gradient banner for events without images
// Uses event name hash to generate consistent, beautiful gradients

const CATEGORY_PALETTES: Record<string, [string, string, string]> = {
  MUSIC: ['#9333ea', '#ec4899', '#f43f5e'],
  SPORTS: ['#059669', '#0d9488', '#06b6d4'],
  CONFERENCE: ['#2563eb', '#4f46e5', '#7c3aed'],
  TECH: ['#2563eb', '#4f46e5', '#7c3aed'],
  THEATRE: ['#b91c1c', '#e11d48', '#f43f5e'],
  ART: ['#d97706', '#f59e0b', '#f43f5e'],
  GAMING: ['#7c3aed', '#6366f1', '#06b6d4'],
  FOOD: ['#ea580c', '#f59e0b', '#fbbf24'],
  FITNESS: ['#059669', '#10b981', '#34d399'],
  OTHER: ['#FF5000', '#E04500', '#ff7a2f'],
}

const DEFAULT_PALETTE: [string, string, string] = ['#FF5000', '#E04500', '#00f5ff']

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function getPatternSvg(seed: number): string {
  const patterns = [
    // Dots
    `<circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.08)"/><circle cx="60" cy="60" r="2" fill="rgba(255,255,255,0.06)"/>`,
    // Diagonal lines
    `<line x1="0" y1="0" x2="80" y2="80" stroke="rgba(255,255,255,0.06)" stroke-width="1"/><line x1="40" y1="0" x2="120" y2="80" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`,
    // Hexagons
    `<polygon points="40,5 65,20 65,50 40,65 15,50 15,20" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`,
    // Crosses
    `<path d="M35 20h10M40 15v10" stroke="rgba(255,255,255,0.07)" stroke-width="1.5"/><path d="M15 55h10M20 50v10" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>`,
    // Waves
    `<path d="M0 40 Q20 20 40 40 Q60 60 80 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>`,
    // Triangles
    `<polygon points="40,10 70,60 10,60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`,
  ]
  return patterns[seed % patterns.length]
}

interface GeneratedBannerProps {
  name: string
  category?: string
  className?: string
  showInitial?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function GeneratedBanner({
  name,
  category,
  className = '',
  showInitial = true,
  size = 'md',
}: GeneratedBannerProps) {
  const hash = hashString(name || 'Event')
  const catKey = category?.toUpperCase() || ''
  const palette = CATEGORY_PALETTES[catKey] || DEFAULT_PALETTE

  // Slight variation based on name hash
  const angle = (hash % 180) + 90
  const patternSvg = getPatternSvg(hash)
  const initial = (name || 'E').charAt(0).toUpperCase()

  const fontSize = size === 'lg' ? 'text-8xl' : size === 'md' ? 'text-6xl' : 'text-4xl'

  const patternDataUri = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">${patternSvg}</svg>`
  )}`

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, ${palette[0]}, ${palette[1]}, ${palette[2]}40)`,
      }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `url("${patternDataUri}")`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${30 + (hash % 40)}% ${30 + (hash % 40)}%, ${palette[0]}40 0%, transparent 70%)`,
        }}
      />

      {/* Initial letter */}
      {showInitial && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-display ${fontSize} text-white/10 select-none`}
            style={{ textShadow: `0 0 60px ${palette[0]}30` }}
          >
            {initial}
          </span>
        </div>
      )}

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-dark-900/80 to-transparent" />
    </div>
  )
}
