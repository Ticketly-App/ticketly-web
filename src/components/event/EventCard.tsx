"use client";

import Link from "next/link";
import { format } from "date-fns";
import { lamportsToSol } from "@/lib/ticketly/ticketly-query";
import { GeneratedBanner } from "@/components/ui/GeneratedBanner";
import { MapPin, Clock } from "lucide-react";

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
  const category = event.categories?.[0] || '';
  const hasRealImage = event.imageUri && !event.imageUri.includes('ticketly.dev/metadata');

  if (view === "list") {
    return (
      <Link href={`/events/${event.pubkey || event._id}`}>
        <div className="ticket-card p-5 flex items-center gap-6 group">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-dark-800">
            {hasRealImage ? (
              <img src={event.imageUri} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <GeneratedBanner name={event.name} category={category} size="sm" showInitial={true} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-white truncate group-hover:text-brand-400 transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-white/40 text-sm">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(startDate, "MMM d, yyyy")}
              </span>
              <span className="text-white/20">|</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.venue}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-display text-brand-400">
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
          {hasRealImage ? (
            <img src={event.imageUri} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <GeneratedBanner name={event.name} category={category} size="md" />
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
          {category && (
            <div className="absolute top-3 left-3">
              <span className="badge text-[10px] bg-dark-900/80 text-white/70 border-white/10 backdrop-blur-sm">
                {category}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark-900 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display text-white truncate group-hover:text-brand-400 transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-white/40">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(startDate, "MMM d, yyyy")}
              </span>
              <span className="text-white/20">·</span>
              <span className="truncate inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.venue}
              </span>
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
              <span className="font-display text-brand-400">
                {minPrice === 0 ? "FREE" : `${lamportsToSol(minPrice).toFixed(3)} SOL`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
