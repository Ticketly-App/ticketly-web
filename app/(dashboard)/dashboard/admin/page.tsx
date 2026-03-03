'use client'

import { useState } from 'react'
import { useIsAdmin } from '@/hooks/use-admin'
import { GradientAvatar } from '@/components/ui/gradient-avatar'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { lamportsToSol } from '@/lib/ticketly/ticketly-query'
import {
  Shield,
  CalendarDays,
  Ticket,
  DollarSign,
  Users,
  UserCheck,
  Store,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  BarChart3,
  ShieldAlert,
  Loader2,
  Crown,
  ShoppingCart,
  Twitter,
  Percent,
  Wallet,
  Gem,
  MapPin,
  CheckCircle2,
  XCircle,
  Tag,
  Repeat2,
  Award,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Globe,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

/* ───────── Types ───────── */
interface OrganizerProfile {
  pubkey: string
  authority: string
  name: string
  website: string
  logoUri: string
  xHandle: string | null
  totalEvents: number
  totalTickets: number
  totalRevenue: number
}

interface OnChainEvent {
  pubkey: string
  name: string
  authority: string
  venue: string
  eventStart: number
  eventEnd: number
  totalMinted: number
  totalRevenue: number
  totalCheckins: number
  totalSupply: number
  isActive: boolean
  tiers: { index: number; tierType: number; price: number; supply: number; minted: number }[]
  symbol: string
  resaleAllowed: boolean
  royaltyBps: number
  totalRoyalties: number
  whitelistGated: boolean
  poapEnabled: boolean
  totalPoapsMinted: number
  gateOperators: number
  timeStatus: 'upcoming' | 'live' | 'past'
}

interface TopOrganizer {
  address: string
  events: number
  revenue: number
  tickets: number
  name: string
  xHandle: string | null
  logoUri: string
}

interface SalesTimelineEntry {
  date: string
  count: number
  revenue: number
}

interface RecentTicket {
  pubkey: string
  owner: string
  originalBuyer: string
  event: string
  tierIndex: number
  pricePaid: number
  isCheckedIn: boolean
  isListed: boolean
  poapMinted: boolean
  mintedAt: number
  resaleCount: number
  transferCount: number
}

interface AnalyticsEntry {
  _id: string
  type: string
  eventPubkey?: string
  wallet?: string
  amount?: number
  timestamp: string
}

interface UserEntry {
  address: string
  tickets: number
}

interface AdminData {
  onChain: {
    totalEvents: number
    cancelledEvents: number
    totalTicketsSold: number
    totalRevenueLamports: number
    totalRevenueSol: number
    totalCheckins: number
    totalUniqueOwners: number
    totalUniqueBuyers: number
    totalTicketAccounts: number
    totalSupply: number
    totalListedOnChain: number
    totalCheckedInTickets: number
    totalPoapMinted: number
    totalRoyalties: number
    totalRoyaltiesSol: number
    checkinRate: number
    sellThroughRate: number
    avgTicketPrice: number
    avgTicketPriceSol: number
    freeEvents: number
    paidEvents: number
    totalOrganizers: number
    organizersWithX: number
    organizers: OrganizerProfile[]
    events: OnChainEvent[]
    topOrganizers: TopOrganizer[]
    salesTimeline: SalesTimelineEntry[]
    ownerBrackets: Record<string, number>
    topVenues: { venue: string; count: number }[]
    tierDistribution: { name: string; value: number }[]
    recentTickets: RecentTicket[]
    allUsers: UserEntry[]
  }
  db: {
    eventCount: number
    ticketCount: number
    listingCount: number
    activeListings: number
    organizerCount: number
    uniqueWallets: number
    recentAnalytics: AnalyticsEntry[]
    ticketsByEvent: { _id: string; count: number; totalSpent: number }[]
    topBuyers: { _id: string; ticketsBought: number; totalSpent: number }[]
    analyticsTypes: { _id: string; count: number }[]
    organizers: any[]
    recentEvents: any[]
    marketplaceVolume: number
    marketplaceSales: number
    eventTimeline: { _id: string; count: number }[]
  }
}

/* ───────── Palette for pie chart ───────── */
const PIE_COLORS = ['#a855f7', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6']

const ANALYTICS_LABELS: Record<string, string> = {
  ticket_mint: 'Mints',
  ticket_checkin: 'Check-ins',
  ticket_transfer: 'Transfers',
  listing_created: 'Listings',
  ticket_sold: 'Sales',
  poap_minted: 'POAPs',
}

const TIER_LABELS = ['GA', 'Early Bird', 'VIP', 'VVIP', 'Custom']

/* ───────── Tabs ───────── */
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'organizers', label: 'Organizers', icon: Crown },
  { id: 'users', label: 'Users & Wallets', icon: Users },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'activity', label: 'Activity', icon: Activity },
] as const

type TabId = (typeof TABS)[number]['id']

/* ───────── Custom Recharts Tooltip ───────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-white font-medium">
          {entry.name}: {entry.name === 'Revenue' ? `${lamportsToSol(entry.value).toFixed(4)} SOL` : entry.value}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs shadow-xl">
      <p className="text-white">{payload[0].name}: <span className="font-mono">{payload[0].value}</span></p>
    </div>
  )
}

/* ───────── Ellipsify ───────── */
function ellipsify(str: string, len = 4) {
  if (!str) return ''
  if (str.length <= len * 2 + 3) return str
  return `${str.slice(0, len)}...${str.slice(-len)}`
}

/* ───────── Copy wallet ───────── */
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

/* ───────── Main Component ───────── */
export default function AdminDashboard() {
  const { publicKey } = useWallet()
  const isAdmin = useIsAdmin()
  const [tab, setTab] = useState<TabId>('overview')
  const [usersExpanded, setUsersExpanded] = useState(false)

  const { data, isLoading, error } = useQuery<AdminData>({
    queryKey: ['admin-dashboard', publicKey?.toBase58()],
    queryFn: async () => {
      const res = await fetch(`/api/admin?wallet=${publicKey!.toBase58()}`)
      if (!res.ok) throw new Error('Unauthorized')
      return res.json()
    },
    enabled: !!publicKey && isAdmin,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  /* ─── Gate: Not connected ─── */
  if (!publicKey) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/05 flex items-center justify-center">
            <Shield className="w-7 h-7 text-white/20" />
          </div>
          <h2 className="font-display text-xl text-white mb-2">Admin Access Required</h2>
          <p className="text-white/40 text-sm">Connect the admin wallet to access the platform dashboard.</p>
        </div>
      </div>
    )
  }

  /* ─── Gate: Not admin ─── */
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="font-display text-xl text-white mb-2">Unauthorized</h2>
          <p className="text-white/40 text-sm">
            This wallet does not have admin privileges. <br />
            <span className="font-mono text-[10px] text-white/20 mt-2 block">{publicKey.toBase58()}</span>
          </p>
        </div>
      </div>
    )
  }

  /* ─── Loading ─── */
  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          <p className="text-white/40 text-sm">Loading platform data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-md">
          <p className="text-red-400 mb-2 font-display">Error loading data</p>
          <p className="text-white/40 text-xs">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  const { onChain, db } = data

  /* ─── KPI cards ─── */
  const kpis = [
    { label: 'Total Events', value: onChain.totalEvents.toString(), sub: `${onChain.freeEvents} free · ${onChain.paidEvents} paid`, icon: CalendarDays, iconBg: 'bg-brand-600/15', iconColor: 'text-brand-400', accent: true },
    { label: 'Tickets Sold', value: onChain.totalTicketsSold.toLocaleString(), sub: `${onChain.totalSupply.toLocaleString()} total supply`, icon: Ticket, iconBg: 'bg-cyan-500/15', iconColor: 'text-neon-cyan', accent: false },
    { label: 'Total Revenue', value: `${onChain.totalRevenueSol.toFixed(4)} SOL`, sub: `Avg ${onChain.avgTicketPriceSol.toFixed(4)} SOL/ticket`, icon: DollarSign, iconBg: 'bg-green-500/15', iconColor: 'text-neon-green', accent: false },
    { label: 'Unique Users', value: onChain.totalUniqueOwners.toLocaleString(), sub: `${onChain.totalUniqueBuyers.toLocaleString()} unique buyers`, icon: Users, iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400', accent: false },
    { label: 'Organizers', value: onChain.totalOrganizers.toString(), sub: `${onChain.organizersWithX} with X linked`, icon: Crown, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', accent: false },
    { label: 'Check-in Rate', value: `${onChain.checkinRate}%`, sub: `${onChain.totalCheckins} / ${onChain.totalTicketAccounts}`, icon: UserCheck, iconBg: 'bg-green-500/15', iconColor: 'text-neon-green', accent: false },
    { label: 'Sell-Through', value: `${onChain.sellThroughRate}%`, sub: `${onChain.totalTicketsSold} / ${onChain.totalSupply}`, icon: Percent, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', accent: false },
    { label: 'X Accounts', value: onChain.organizersWithX.toString(), sub: `${onChain.totalOrganizers ? Math.round(onChain.organizersWithX / onChain.totalOrganizers * 100) : 0}% of organizers`, icon: Twitter, iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400', accent: false },
    { label: 'POAPs Minted', value: onChain.totalPoapMinted.toLocaleString(), sub: `${onChain.events.filter(e => e.poapEnabled).length} POAP events`, icon: Award, iconBg: 'bg-pink-500/15', iconColor: 'text-pink-400', accent: false },
    { label: 'Royalties', value: `${onChain.totalRoyaltiesSol.toFixed(4)} SOL`, sub: `From resales`, icon: Gem, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', accent: false },
    { label: 'Marketplace', value: `${lamportsToSol(db.marketplaceVolume).toFixed(4)} SOL`, sub: `${db.marketplaceSales} completed sales`, icon: Store, iconBg: 'bg-pink-500/15', iconColor: 'text-pink-400', accent: false },
    { label: 'Active Listings', value: `${db.activeListings} / ${db.listingCount}`, sub: `${onChain.totalListedOnChain} listed on-chain`, icon: Tag, iconBg: 'bg-orange-500/15', iconColor: 'text-orange-400', accent: false },
  ]

  /* Sales chart data */
  const salesChartData = onChain.salesTimeline.map((d) => ({
    date: d.date.slice(5),
    Tickets: d.count,
    Revenue: d.revenue,
  }))

  /* Analytics pie */
  const pieData = db.analyticsTypes.map((t) => ({
    name: ANALYTICS_LABELS[t._id] || t._id,
    value: t.count,
  }))

  /* Event bar chart — top 8 */
  const eventBarData = onChain.events.slice(0, 8).map((e) => ({
    name: e.name.length > 16 ? e.name.slice(0, 14) + '…' : e.name,
    Revenue: lamportsToSol(e.totalRevenue),
    Tickets: e.totalMinted,
  }))

  /* Owner brackets for pie */
  const ownerBracketData = Object.entries(onChain.ownerBrackets || {}).map(([name, value]) => ({ name, value }))

  /* Feature adoption */
  const featureUsage = [
    { name: 'Resale Enabled', count: onChain.events.filter(e => e.resaleAllowed).length, total: onChain.events.length, color: '#06b6d4' },
    { name: 'Whitelist Gated', count: onChain.events.filter(e => e.whitelistGated).length, total: onChain.events.length, color: '#f59e0b' },
    { name: 'POAP Enabled', count: onChain.events.filter(e => e.poapEnabled).length, total: onChain.events.length, color: '#ec4899' },
    { name: 'Gate Operators', count: onChain.events.filter(e => e.gateOperators > 0).length, total: onChain.events.length, color: '#22c55e' },
  ]

  /* Event time status breakdown */
  const eventStatusData = [
    { name: 'Upcoming', value: onChain.events.filter(e => e.timeStatus === 'upcoming').length },
    { name: 'Live Now', value: onChain.events.filter(e => e.timeStatus === 'live').length },
    { name: 'Past', value: onChain.events.filter(e => e.timeStatus === 'past').length },
    ...(onChain.cancelledEvents > 0 ? [{ name: 'Cancelled', value: onChain.cancelledEvents }] : []),
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="heading-display text-3xl md:text-4xl text-white mb-1">Admin Panel</h1>
            <p className="text-white/40 text-sm">Platform-wide metrics, on-chain data & analytics.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Activity className="w-3 h-3" />
          Live data &middot; auto-refresh 60s
        </div>
      </header>

      {/* ─── Tab Navigation ─── */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/05 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
      {tab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {kpis.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="glass rounded-xl p-4 group hover:bg-white/03 transition-all hover:shadow-lg hover:shadow-brand-600/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
                    <div className={`w-7 h-7 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-3 h-3 ${s.iconColor}`} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className={`font-display text-lg ${s.accent ? 'text-brand-400' : 'text-white'}`}>{s.value}</p>
                  {s.sub && <p className="text-[9px] text-white/25 mt-0.5">{s.sub}</p>}
                </div>
              )
            })}
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sales Timeline */}
            <div className="lg:col-span-2 glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  <h3 className="font-display text-white text-sm">Sales Timeline</h3>
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Last 30 days</span>
              </div>
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={salesChartData}>
                    <defs>
                      <linearGradient id="gradTickets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="Tickets" stroke="#a855f7" fill="url(#gradTickets)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">No timeline data yet</div>
              )}
            </div>

            {/* Activity Breakdown */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-white text-sm">Activity Breakdown</h3>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconSize={8} formatter={(val: string) => <span className="text-white/50 text-[10px] ml-1">{val}</span>} />
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-white/20 text-sm">No activity data yet</div>
              )}
            </div>
          </div>

          {/* Mid-row: Event Status + Owner Distribution + Tier Mix + Feature Adoption */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* Event Status */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-brand-400" />
                <h3 className="font-display text-white text-sm">Event Status</h3>
              </div>
              {eventStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={eventStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                      {eventStatusData.map((_, idx) => (
                        <Cell key={idx} fill={['#a855f7', '#22c55e', '#64748b', '#ef4444'][idx]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconSize={6} formatter={(val: string) => <span className="text-white/50 text-[9px] ml-1">{val}</span>} />
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-white/20 text-sm">No events</div>
              )}
            </div>

            {/* Owner Distribution */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-violet-400" />
                <h3 className="font-display text-white text-sm">Ticket Distribution</h3>
              </div>
              {ownerBracketData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={ownerBracketData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                      {ownerBracketData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconSize={6} formatter={(val: string) => <span className="text-white/50 text-[9px] ml-1">{val}</span>} />
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-white/20 text-sm">No data</div>
              )}
            </div>

            {/* Tier Mix */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-white text-sm">Tier Breakdown</h3>
              </div>
              {onChain.tierDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={onChain.tierDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                      {onChain.tierDistribution.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconSize={6} formatter={(val: string) => <span className="text-white/50 text-[9px] ml-1">{val}</span>} />
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-white/20 text-sm">No data</div>
              )}
            </div>

            {/* Feature Adoption */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gem className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display text-white text-sm">Feature Adoption</h3>
              </div>
              <div className="space-y-3">
                {featureUsage.map((f) => {
                  const pct = f.total > 0 ? Math.round(f.count / f.total * 100) : 0
                  return (
                    <div key={f.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white/50">{f.name}</span>
                        <span className="text-[10px] text-white/30 font-mono">{f.count}/{f.total} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-white/05 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: f.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Revenue Bar Chart */}
          {eventBarData.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neon-green" />
                  <h3 className="font-display text-white text-sm">Revenue by Event</h3>
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Top {eventBarData.length}</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={eventBarData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs shadow-xl">
                          <p className="text-white/50 mb-1">{label}</p>
                          {payload.map((p: any, i: number) => (
                            <p key={i} className="text-white">
                              {p.name}: {p.name === 'Revenue' ? `${Number(p.value).toFixed(4)} SOL` : p.value}
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Legend iconSize={8} formatter={(val: string) => <span className="text-white/50 text-[10px] ml-1">{val}</span>} />
                  <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Tickets" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* DB Sync Status */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-white/30" />
              <h3 className="text-xs text-white/40 uppercase tracking-wider font-medium">Database Sync</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <SyncStat label="DB Events" value={db.eventCount} chainValue={onChain.totalEvents} />
              <SyncStat label="DB Tickets" value={db.ticketCount} chainValue={onChain.totalTicketAccounts} />
              <SyncStat label="DB Organizers" value={db.organizerCount} chainValue={onChain.totalOrganizers} />
              <SyncStat label="Total Listings" value={db.listingCount} />
              <SyncStat label="DB Wallets" value={db.uniqueWallets} chainValue={onChain.totalUniqueOwners} />
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════ EVENTS TAB ═══════════════════ */}
      {tab === 'events' && (
        <>
          {/* Event Status Cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <StatCard label="Total Events" value={onChain.totalEvents} icon={CalendarDays} iconColor="text-brand-400" iconBg="bg-brand-600/15" />
            <StatCard label="Upcoming" value={onChain.events.filter(e => e.timeStatus === 'upcoming').length} icon={Clock} iconColor="text-violet-400" iconBg="bg-violet-500/15" />
            <StatCard label="Live Now" value={onChain.events.filter(e => e.timeStatus === 'live').length} icon={Activity} iconColor="text-neon-green" iconBg="bg-green-500/15" />
            <StatCard label="Completed" value={onChain.events.filter(e => e.timeStatus === 'past').length} icon={CheckCircle2} iconColor="text-white/50" iconBg="bg-white/05" />
            <StatCard label="Cancelled" value={onChain.cancelledEvents} icon={XCircle} iconColor="text-red-400" iconBg="bg-red-500/15" />
          </div>

          {/* Top Venues */}
          {onChain.topVenues.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-pink-400" />
                <h3 className="font-display text-white text-sm">Top Venues</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {onChain.topVenues.map(v => (
                  <span key={v.venue} className="badge text-[10px] bg-white/05 text-white/60 border-white/10">
                    {v.venue} <span className="text-brand-400 ml-1">×{v.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Events Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/08 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-400" />
                <h2 className="font-display text-white text-sm">All Events ({onChain.events.length})</h2>
              </div>
            </div>
            {onChain.events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/08">
                      <th className="text-left px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Event</th>
                      <th className="text-left px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Venue</th>
                      <th className="text-left px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Date</th>
                      <th className="text-left px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Status</th>
                      <th className="text-right px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Sold / Supply</th>
                      <th className="text-right px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Check-in</th>
                      <th className="text-right px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Revenue</th>
                      <th className="text-center px-5 py-3 text-[10px] text-white/40 uppercase tracking-wider font-medium">Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onChain.events.map((ev) => (
                      <tr key={ev.pubkey} className="border-b border-white/05 hover:bg-white/03 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-white font-medium text-xs">{ev.name}</p>
                            <p className="text-white/20 font-mono text-[9px]">{ellipsify(ev.pubkey, 6)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-white/50 text-xs max-w-[140px] truncate">{ev.venue || '—'}</td>
                        <td className="px-5 py-3 text-white/50 text-xs whitespace-nowrap">
                          {ev.eventStart ? new Date(ev.eventStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`badge text-[9px] ${
                            ev.timeStatus === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            ev.timeStatus === 'upcoming' ? 'badge-active' :
                            'bg-white/10 text-white/50 border-white/10'
                          }`}>
                            {ev.timeStatus === 'live' ? '● Live' : ev.timeStatus === 'upcoming' ? 'Upcoming' : 'Past'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-white/60 font-mono text-xs">
                          {ev.totalMinted} / {ev.totalSupply}
                        </td>
                        <td className="px-5 py-3 text-right text-white/60 font-mono text-xs">
                          {ev.totalCheckins}
                          {ev.totalMinted > 0 && <span className="text-white/25 ml-1">({Math.round(ev.totalCheckins / ev.totalMinted * 100)}%)</span>}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-brand-400 text-xs">{lamportsToSol(ev.totalRevenue).toFixed(4)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {ev.resaleAllowed && <span className="text-[8px] badge bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-1">Resale</span>}
                            {ev.poapEnabled && <span className="text-[8px] badge bg-pink-500/10 text-pink-400 border-pink-500/20 px-1">POAP</span>}
                            {ev.whitelistGated && <span className="text-[8px] badge bg-amber-500/10 text-amber-400 border-amber-500/20 px-1">WL</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-white/30 text-sm">No events found on chain.</div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════ ORGANIZERS TAB ═══════════════════ */}
      {tab === 'organizers' && (
        <>
          {/* Organizer Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Organizers" value={onChain.totalOrganizers} icon={Crown} iconColor="text-amber-400" iconBg="bg-amber-500/15" />
            <StatCard label="With X/Twitter" value={onChain.organizersWithX} icon={Twitter} iconColor="text-sky-400" iconBg="bg-sky-500/15" />
            <StatCard label="DB Organizers" value={db.organizerCount} icon={Globe} iconColor="text-violet-400" iconBg="bg-violet-500/15" />
            <StatCard label="Total Events Created" value={onChain.events.length} icon={CalendarDays} iconColor="text-brand-400" iconBg="bg-brand-600/15" />
          </div>

          {/* Organizer Profiles (On-Chain) */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/08 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h2 className="font-display text-white text-sm">On-Chain Organizer Profiles ({onChain.organizers.length})</h2>
              </div>
            </div>
            {onChain.organizers.length > 0 ? (
              <div className="divide-y divide-white/05">
                {onChain.organizers.map((org) => (
                  <div key={org.pubkey} className="px-5 py-4 flex items-center gap-4 hover:bg-white/03 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      {org.logoUri ? (
                        <img src={org.logoUri} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <OrganizerAvatar logoUri={org.logoUri} authority={org.authority} name={org.name} size={40} />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">{org.name || 'Unnamed'}</p>
                        {org.xHandle && (
                          <a href={`https://x.com/${org.xHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-[10px]">
                            <Twitter className="w-3 h-3" />@{org.xHandle}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button onClick={() => copyToClipboard(org.authority)} className="text-white/20 font-mono text-[9px] hover:text-white/40 flex items-center gap-1">
                          {ellipsify(org.authority, 6)} <Copy className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-6 text-xs shrink-0">
                      <div className="text-center">
                        <p className="text-white/30 text-[9px]">Events</p>
                        <p className="text-white font-mono">{org.totalEvents}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/30 text-[9px]">Tickets</p>
                        <p className="text-white font-mono">{org.totalTickets}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/30 text-[9px]">Revenue</p>
                        <p className="text-brand-400 font-mono">{lamportsToSol(org.totalRevenue).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-white/30 text-sm">No organizer profiles found on-chain.</div>
            )}
          </div>

          {/* Top Organizers by Revenue */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/08 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <h3 className="font-display text-white text-sm">Top Organizers by Revenue</h3>
            </div>
            {onChain.topOrganizers.length > 0 ? (
              <div className="divide-y divide-white/05">
                {onChain.topOrganizers.map((org, i) => (
                  <div key={org.address} className="px-5 py-3 flex items-center gap-3 hover:bg-white/03 transition-colors">
                    <span className={`text-sm font-display w-6 text-center ${i < 3 ? 'text-amber-400' : 'text-white/20'}`}>{i + 1}</span>
                    {org.logoUri ? (
                      <img src={org.logoUri} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <GradientAvatar seed={org.address} name={org.name} size={28} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white/70 text-xs truncate">{org.name || ellipsify(org.address, 6)}</p>
                        {org.xHandle && (
                          <span className="text-sky-400 text-[9px]">@{org.xHandle}</span>
                        )}
                      </div>
                      <p className="text-white/30 text-[10px]">{org.events} events · {org.tickets} tickets</p>
                    </div>
                    <span className="text-brand-400 font-mono text-xs font-medium">{lamportsToSol(org.revenue).toFixed(4)} SOL</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-white/20 text-xs">No data</div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════ USERS TAB ═══════════════════ */}
      {tab === 'users' && (
        <>
          {/* User Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <StatCard label="Unique Owners" value={onChain.totalUniqueOwners} icon={Users} iconColor="text-violet-400" iconBg="bg-violet-500/15" />
            <StatCard label="Unique Buyers" value={onChain.totalUniqueBuyers} icon={Wallet} iconColor="text-cyan-400" iconBg="bg-cyan-500/15" />
            <StatCard label="DB Wallets" value={db.uniqueWallets} icon={Eye} iconColor="text-brand-400" iconBg="bg-brand-600/15" />
            <StatCard label="Tickets on-chain" value={onChain.totalTicketAccounts} icon={Ticket} iconColor="text-neon-green" iconBg="bg-green-500/15" />
          </div>

          {/* Owner Distribution + Top Buyers */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Owner distribution donut */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-violet-400" />
                <h3 className="font-display text-white text-sm">Tickets per User</h3>
              </div>
              {ownerBracketData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={ownerBracketData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                      {ownerBracketData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconSize={8} formatter={(val: string) => <span className="text-white/50 text-[10px] ml-1">{val}</span>} />
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-white/20 text-sm">No data</div>
              )}
            </div>

            {/* Top Buyers */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/08 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-white text-sm">Top Buyers</h3>
              </div>
              {db.topBuyers.length > 0 ? (
                <div className="divide-y divide-white/05">
                  {db.topBuyers.map((buyer, i) => (
                    <div key={buyer._id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/03 transition-colors">
                      <span className={`text-xs font-display w-5 text-center ${i < 3 ? 'text-amber-400' : 'text-white/20'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <button onClick={() => copyToClipboard(buyer._id)} className="text-white/70 font-mono text-[11px] truncate flex items-center gap-1 hover:text-white/90">
                          {ellipsify(buyer._id, 6)} <Copy className="w-2.5 h-2.5 text-white/20" />
                        </button>
                        <p className="text-white/30 text-[10px]">{buyer.ticketsBought} tickets</p>
                      </div>
                      <span className="text-neon-cyan font-mono text-xs">{lamportsToSol(buyer.totalSpent).toFixed(2)} SOL</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-white/20 text-xs">No data</div>
              )}
            </div>
          </div>

          {/* All Users / Wallets Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/08 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-violet-400" />
                <h2 className="font-display text-white text-sm">All Wallet Addresses ({onChain.allUsers.length})</h2>
              </div>
              {onChain.allUsers.length > 20 && (
                <button onClick={() => setUsersExpanded(!usersExpanded)} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60">
                  {usersExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {usersExpanded ? 'Collapse' : `Show all ${onChain.allUsers.length}`}
                </button>
              )}
            </div>
            {onChain.allUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/08">
                      <th className="text-left px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">#</th>
                      <th className="text-left px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Wallet Address</th>
                      <th className="text-right px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Tickets Held</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersExpanded ? onChain.allUsers : onChain.allUsers.slice(0, 20)).map((u, i) => (
                      <tr key={u.address} className="border-b border-white/05 hover:bg-white/03 transition-colors">
                        <td className="px-5 py-2 text-white/20 font-mono text-[10px]">{i + 1}</td>
                        <td className="px-5 py-2">
                          <button onClick={() => copyToClipboard(u.address)} className="text-white/60 font-mono text-[11px] flex items-center gap-1.5 hover:text-white/80">
                            {ellipsify(u.address, 8)}
                            <Copy className="w-2.5 h-2.5 text-white/20" />
                          </button>
                        </td>
                        <td className="px-5 py-2 text-right text-white/70 font-mono text-xs">{u.tickets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-white/30 text-sm">No users found.</div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════ MARKETPLACE TAB ═══════════════════ */}
      {tab === 'marketplace' && (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Volume" value={`${lamportsToSol(db.marketplaceVolume).toFixed(4)} SOL`} icon={DollarSign} iconColor="text-neon-green" iconBg="bg-green-500/15" />
            <StatCard label="Completed Sales" value={db.marketplaceSales} icon={ShoppingCart} iconColor="text-cyan-400" iconBg="bg-cyan-500/15" />
            <StatCard label="Active Listings" value={db.activeListings} icon={Tag} iconColor="text-amber-400" iconBg="bg-amber-500/15" />
            <StatCard label="Listed On-chain" value={onChain.totalListedOnChain} icon={Store} iconColor="text-pink-400" iconBg="bg-pink-500/15" />
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Royalties" value={`${onChain.totalRoyaltiesSol.toFixed(4)} SOL`} icon={Gem} iconColor="text-emerald-400" iconBg="bg-emerald-500/15" />
            <StatCard label="Resale Events" value={onChain.events.filter(e => e.resaleAllowed).length} icon={Repeat2} iconColor="text-violet-400" iconBg="bg-violet-500/15" />
            <StatCard label="Total Listings (All)" value={db.listingCount} icon={Store} iconColor="text-white/50" iconBg="bg-white/05" />
            <StatCard label="POAPs Minted" value={onChain.totalPoapMinted} icon={Award} iconColor="text-pink-400" iconBg="bg-pink-500/15" />
          </div>

          {/* Recent Tickets with resale/transfer data */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/08 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-400" />
              <h3 className="font-display text-white text-sm">Recent Tickets (On-Chain)</h3>
            </div>
            {onChain.recentTickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/08">
                      <th className="text-left px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Owner</th>
                      <th className="text-right px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Price</th>
                      <th className="text-center px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Tier</th>
                      <th className="text-center px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Status</th>
                      <th className="text-center px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Resales</th>
                      <th className="text-center px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Transfers</th>
                      <th className="text-left px-5 py-2 text-[10px] text-white/40 uppercase tracking-wider font-medium">Minted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onChain.recentTickets.map((t) => (
                      <tr key={t.pubkey} className="border-b border-white/05 hover:bg-white/03 transition-colors">
                        <td className="px-5 py-2 text-white/60 font-mono text-[10px]">{ellipsify(t.owner, 6)}</td>
                        <td className="px-5 py-2 text-right text-brand-400 font-mono text-xs">{lamportsToSol(t.pricePaid).toFixed(4)}</td>
                        <td className="px-5 py-2 text-center text-white/50 text-[10px]">{TIER_LABELS[t.tierIndex] || `T${t.tierIndex}`}</td>
                        <td className="px-5 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {t.isCheckedIn && <span className="text-[8px] badge bg-green-500/15 text-green-400 border-green-500/20 px-1">Checked</span>}
                            {t.isListed && <span className="text-[8px] badge bg-amber-500/15 text-amber-400 border-amber-500/20 px-1">Listed</span>}
                            {t.poapMinted && <span className="text-[8px] badge bg-pink-500/15 text-pink-400 border-pink-500/20 px-1">POAP</span>}
                            {!t.isCheckedIn && !t.isListed && !t.poapMinted && <span className="text-white/20 text-[9px]">—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-2 text-center text-white/50 font-mono text-xs">{t.resaleCount}</td>
                        <td className="px-5 py-2 text-center text-white/50 font-mono text-xs">{t.transferCount}</td>
                        <td className="px-5 py-2 text-white/30 text-[10px]">
                          {t.mintedAt ? new Date(t.mintedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-white/30 text-sm">No ticket data.</div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════ ACTIVITY TAB ═══════════════════ */}
      {tab === 'activity' && (
        <>
          {/* Analytics Summary Cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {db.analyticsTypes.map((t) => (
              <div key={t._id} className="glass rounded-xl p-4">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{ANALYTICS_LABELS[t._id] || t._id}</p>
                <p className="text-white font-display text-lg">{t.count}</p>
              </div>
            ))}
          </div>

          {/* Activity Feed + Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity Feed */}
            <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/08 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-green" />
                <h3 className="font-display text-white text-sm">Recent Activity</h3>
              </div>
              {db.recentAnalytics.length > 0 ? (
                <div className="divide-y divide-white/05 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  {db.recentAnalytics.map((a) => (
                    <div key={a._id} className="px-5 py-3 hover:bg-white/03 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`badge text-[9px] ${
                          a.type === 'ticket_mint' ? 'bg-brand-600/20 text-brand-400 border-brand-600/30' :
                          a.type === 'ticket_checkin' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          a.type === 'ticket_sold' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                          a.type === 'listing_created' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          a.type === 'poap_minted' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                          'bg-white/10 text-white/50 border-white/10'
                        }`}>
                          {ANALYTICS_LABELS[a.type] || a.type}
                        </span>
                        <span className="text-[9px] text-white/20 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(a.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {a.wallet && <p className="text-white/30 font-mono text-[9px] truncate">{ellipsify(a.wallet, 6)}</p>}
                      {a.amount != null && a.amount > 0 && (
                        <p className="text-brand-400 font-mono text-[10px]">{lamportsToSol(a.amount).toFixed(4)} SOL</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-white/20 text-xs">No activity logged</div>
              )}
            </div>

            {/* Activity Pie */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-white text-sm">Activity Breakdown</h3>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconSize={8} formatter={(val: string) => <span className="text-white/50 text-[10px] ml-1">{val}</span>} />
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-white/20 text-sm">No activity data</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ───────── Reusable Stat Card ───────── */
function StatCard({ label, value, icon: Icon, iconColor, iconBg }: {
  label: string
  value: string | number
  icon: any
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="glass rounded-xl p-4 hover:bg-white/03 transition-all">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-3 h-3 ${iconColor}`} strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-white font-display text-lg">{value}</p>
    </div>
  )
}

/* ───────── Sync Stat Subcomponent ───────── */
function SyncStat({ label, value, chainValue }: { label: string; value: number; chainValue?: number }) {
  const inSync = chainValue == null || value === chainValue
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white font-mono text-sm">{value}</span>
        {chainValue != null && (
          <>
            <span className="text-white/20">/</span>
            <span className="text-white/40 font-mono text-sm">{chainValue} on-chain</span>
            <span className={`w-1.5 h-1.5 rounded-full ${inSync ? 'bg-neon-green' : 'bg-amber-400'}`} />
          </>
        )}
      </div>
    </div>
  )
}

/* ───────── Organizer Avatar ───────── */
function OrganizerAvatar({ logoUri, authority, name, size = 32, className = '' }: { logoUri?: string, authority: string, name: string, size?: number, className?: string }) {
  const [error, setError] = useState(false)
  if (error || !logoUri) {
    return <GradientAvatar seed={authority || name} name={name} size={size} className={className} />
  }
  return (
    <img
      src={logoUri}
      alt={name}
      className={`rounded-full object-cover ring-1 ring-white/10 ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  )
}
