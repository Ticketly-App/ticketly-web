 'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useTicketlyEvents } from '@/hooks/use-ticketly-events'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'

export function EventsList() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const { data: events = [], isLoading } = useTicketlyEvents({ activeOnly: true })

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !search.trim() ||
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.venue.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = category === 'all' || event.symbol.toLowerCase().includes(category)

      return matchesSearch && matchesCategory
    })
  }, [events, search, category])

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Discover events</h1>
        <p className="text-muted-foreground max-w-2xl">
          All tickets are on-chain, verifiable, and programmable. Filter by category or search by name, venue, or
          description.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by name, venue, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="theatre">Theatre</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <Card className="p-6 text-center text-sm text-muted-foreground">Loading events from devnet...</Card>
        )}

        {!isLoading && filtered.map((event) => (
          <Card key={event.publicKey} className="flex flex-col justify-between p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold leading-tight">{event.name}</h2>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {event.symbol || 'TICKET'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-semibold">When:</span>{' '}
                  {new Date(Number(event.eventStart) * 1000).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p>
                  <span className="font-semibold">Where:</span> {event.venue}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                <div className="font-mono font-semibold">
                  {event.ticketTiers.length ? `${lamportsToSol(event.ticketTiers[0].price).toFixed(4)} SOL` : 'TBA'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {event.totalMinted.toString()} minted
                </div>
              </div>
              <Button asChild size="sm">
                <Link href={`/events/${event.publicKey}`}>View &amp; buy</Link>
              </Button>
            </div>
          </Card>
        ))}

        {!isLoading && filtered.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No events found on devnet for this cluster. Try another cluster or create an event from the dashboard.
          </Card>
        )}
      </div>
    </section>
  )
}

