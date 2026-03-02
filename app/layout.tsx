import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import React from 'react'
import { Analytics } from '@vercel/analytics/next'

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas-neue', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://ticketly.tech'),
  title: {
    default: 'Ticketly | On-Chain Event Ticketing on Solana',
    template: '%s | Ticketly',
  },
  description: 'Mint, verify, and trade event tickets as NFTs on Solana. Zero fraud, instant check-in, programmable royalties.',
  manifest: '/site.webmanifest',
  themeColor: '#030303',
  icons: {
    icon: [
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Ticketly | On-Chain Event Ticketing on Solana',
    description: 'Tokenized tickets. Zero fraud. Instant check-in. Powered by Solana.',
    siteName: 'Ticketly',
    url: 'https://ticketly.tech',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ticketly | On-Chain Event Ticketing on Solana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ticketly | On-Chain Event Ticketing on Solana',
    description: 'Tokenized tickets. Zero fraud. Instant check-in. Powered by Solana.',
    site: '@ticketly_app',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-dark-950">
        <AppProviders>
          <AppLayout>{children}</AppLayout>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
