'use client'

import { Toaster } from './ui/sonner'
import React from 'react'
import { WalletConnectModal } from '@/components/layout/WalletConnectModal'

export function AppLayout({
  children,
}: {
  children: React.ReactNode
  links?: { label: string; path: string }[]
}) {
  return (
    <>
      {children}
      <WalletConnectModal />
      <Toaster />
    </>
  )
}
