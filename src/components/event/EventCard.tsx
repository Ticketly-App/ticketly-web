"use client";

import Link from "next/link";
import { format } from "date-fns";
import { lamportsToSol } from "@/lib/ticketly/ticketly-query";

interface EventCardProps {
  event: any;
  view?: "grid" | "list";
}

export function EventCard({ event, view = "grid" }: EventCardProps) {
  const startDate = new Date(event.startTime);
  const minPrice = event.tiers?.reduce((min: number, t: any) => Math.min(min, t.price), Infinity) || 0;
  const totalSupply = event.tiers?.reduce((sum: number, t: any) => sum + t.supply, 0) || 0;
  const totalSold = event.tiers?.reduce((sum: number, t: any) => sum + t.sold, 0) || 0;
  const soldPercent = totalSupply > 0 ? (totalSold / totalSupply) * 100 : 0;
  const isSoldOut = soldPercent >= 100;

  if (view === "list") {
    return (
      <Link href={`/events/${event.pubkey || event._id}`}>
        <div className="ticket-card p-5 flex items-center gap-6 group">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-dark-800">
            {event.imageUri ? (
              <img src={event.imageUri} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-800 to-brand-950 flex items-center justify-center text-3xl">
                🎭
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-white truncate group-hover:text-brand-400 transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-white/40 text-sm">
              <span>{format(startDate, "MMM d, yyyy")}</span>
              <span className="text-white/20">|</span>
              <span>{event.venue}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-display font-bold text-brand-400">
              {minPrice === 0 ? "FREE" : `${lamportsToSol(minPrice).toFixed(3)} SOL`}
            </div>
            <div className="text-xs text-white/30 mt-1">
              {totalSold}/{totalSupply} sold
            </div>
          </div>
          <div
            className={`badge text-[10px] ${
              isSoldOut
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : event.status === "Active"
                ? "badge-active"
                : "bg-white/10 text-white/50 border-white/10"
            }`}
          >
            {isSoldOut ? "Sold Out" : event.status}
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/events/${event.pubkey || event._id}`}>
      <div className="ticket-card group overflow-hidden hover:scale-[1.02] transition-all duration-300">
        {/* Image */}
        <div className="h-44 overflow-hidden relative">
          {event.imageUri ? (
            <img src={event.imageUri} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-800 via-brand-900 to-dark-900 flex items-center justify-center">
              <span className="text-5xl opacity-50">🎭</span>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`badge text-[10px] backdrop-blur-sm ${
                isSoldOut
                  ? "bg-red-500/30 text-red-300 border-red-500/40"
                  : event.status === "Active"
                  ? "badge-active"
                  : "bg-white/10 text-white/60 border-white/20"
              }`}
            >
              {isSoldOut ? "Sold Out" : event.status}
            </span>
          </div>
          {/* Category */}
          {event.categories?.[0] && (
            <div className="absolute top-3 left-3">
              <span className="badge text-[10px] bg-dark-900/80 text-white/70 border-white/10 backdrop-blur-sm">
                {event.categories[0]}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark-900 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-bold text-white truncate group-hover:text-brand-400 transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-white/40">
              <span>{format(startDate, "MMM d, yyyy")}</span>
              <span className="text-white/20">·</span>
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-1.5 rounded-full bg-white/05 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-cyan transition-all"
                style={{ width: `${Math.min(soldPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-white/30">
                {totalSold}/{totalSupply} sold
              </span>
              <span className="font-display font-bold text-brand-400">
                {minPrice === 0 ? "FREE" : `${lamportsToSol(minPrice).toFixed(3)} SOL`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
