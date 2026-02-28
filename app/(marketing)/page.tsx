import { AppHero } from '@/components/app-hero'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

export default function MarketingLandingPage() {
  return (
    <div className="space-y-10 md:space-y-12">
      <AppHero
        title="Ticketly – on-chain ticketing that just works."
        subtitle={
          <>
            Sell, manage, and verify event tickets on Solana with anti-bot minting, programmable transfers, and instant
            settlement.
          </>
        }
      >
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard/events/create">Create an event</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/events">Browse events</Link>
          </Button>
        </div>
      </AppHero>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Fraud-resistant tickets"
          description="Tickets are NFTs on Solana – verifiable, traceable, and resistant to double spend or screenshot fraud."
        />
        <FeatureCard
          title="Programmable resale"
          description="Configure royalties, price caps, and whitelists for secondary sales directly in your ticket program."
        />
        <FeatureCard
          title="Instant payouts"
          description="Receive revenue on-chain in seconds with transparent settlement and full on-chain history."
        />
      </section>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-4 h-full flex flex-col justify-between">
      <div className="space-y-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}

