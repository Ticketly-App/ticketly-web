'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EventCard } from '@/components/event/EventCard'
import { useTicketlyEvents, mapTicketTier } from '@/hooks/use-ticketly-events'

const CATEGORIES = ['All', 'Music', 'Sports', 'Tech', 'Art', 'Food', 'Conference', 'Gaming', 'Fitness']
const PAGE_SIZE = 12

export default function EventsPage() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const { data: rawEvents = [], isLoading } = useTicketlyEvents()

  // Transform on-chain events to EventCard format (exclude cancelled & ended)
  const nowSec = BigInt(Math.floor(Date.now() / 1000))
  const allEvents = useMemo(() => {
    return rawEvents.filter((ev) => !ev.isCancelled && ev.eventEnd > nowSec).map((ev) => {
      const tiers = ev.ticketTiers.map(mapTicketTier)
      return {
        pubkey: ev.publicKey,
        name: ev.name,
        description: ev.description,
        venue: ev.venue,
        imageUri: ev.metadataUri,
        startTime: new Date(Number(ev.eventStart) * 1000).toISOString(),
        endTime: new Date(Number(ev.eventEnd) * 1000).toISOString(),
        categories: ev.symbol ? [ev.symbol] : [],
        status: ev.isCancelled ? 'Cancelled' : ev.isActive ? 'Active' : 'Draft',
        tiers: tiers.map((t) => ({
          id: t.tierIndex,
          name: t.tierType,
          price: Number(t.price),
          supply: t.supply,
          sold: t.minted,
        })),
      }
    })
  }, [rawEvents])

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = allEvents
    if (category !== 'All') {
      const cat = category.toUpperCase()
      result = result.filter(
        (e) =>
          e.categories.some((c: string) => c.toUpperCase().includes(cat)) ||
          e.name.toUpperCase().includes(cat),
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      )
    }
    return result
  }, [allEvents, category, search])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const events = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="badge badge-active mb-4">Live Events</div>
            <h1 className="heading-display text-5xl text-white mb-3">
              Discover <span className="gradient-text">Events</span>
            </h1>
            <p className="text-white/40">On-chain verified events. Zero fake tickets.</p>
          </div>

          {/* Search + View Toggle */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search events, venues, organizers..."
                className="input-field pl-12 w-full"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("grid")}
                className={`p-3 rounded-lg border transition-all ${view === "grid" ? "bg-brand-600/20 border-brand-600/30 text-brand-400" : "glass border-white/08 text-white/40 hover:text-white"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-3 rounded-lg border transition-all ${view === "list" ? "bg-brand-600/20 border-brand-600/30 text-brand-400" : "glass border-white/08 text-white/40 hover:text-white"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-brand-600/20 text-brand-400 border border-brand-600/30"
                    : "glass border border-white/08 text-white/50 hover:text-white hover:border-white/15"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className={view === "grid" ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass rounded-xl animate-pulse">
                  {view === "grid" ? (
                    <>
                      <div className="h-44 bg-white/5 rounded-t-xl" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 w-3/4 bg-white/5 rounded" />
                        <div className="h-3 w-1/2 bg-white/5 rounded" />
                        <div className="h-1.5 bg-white/5 rounded-full" />
                      </div>
                    </>
                  ) : (
                    <div className="p-5 flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-48 bg-white/5 rounded" />
                        <div className="h-3 w-32 bg-white/5 rounded" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && events.length === 0 && (
            <div className="glass rounded-2xl p-16 text-center">
              <p className="text-4xl mb-4 opacity-50">🎭</p>
              <p className="text-white/50 text-sm">No events found{category !== 'All' ? ` in ${category}` : ''}.</p>
              <p className="text-white/30 text-xs mt-1">
                {allEvents.length === 0 ? 'Create your first event from the Dashboard.' : 'Try a different search or category.'}
              </p>
            </div>
          )}

          {/* Events Grid/List */}
          {!isLoading && events.length > 0 && (
            <div className={view === "grid" ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {events.map((event: any) => (
                <EventCard key={event.pubkey} event={event} view={view} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? "bg-brand-600/20 text-brand-400 border border-brand-600/30"
                          : "glass text-white/40 hover:text-white border border-white/05"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}

          {/* Results count */}
          {!isLoading && total > 0 && (
            <p className="text-center text-xs text-white/30 mt-4">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} events
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
