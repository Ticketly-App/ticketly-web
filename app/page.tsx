import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LiveStats } from "@/components/landing/LiveStats";
import {
  ArrowRight,
  PlusCircle,
  CalendarPlus,
  Ticket,
  ShieldCheck,
  Zap,
  Award,
  DollarSign,
  BarChart3,
  Lock,
  Sparkles,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] animate-pulse-slow" style={{animationDelay: "2s"}} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-900/20 to-transparent rounded-full" />

          {/* Floating orbs - removed */}

          {/* Grid lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border mb-8 animate-slide-up">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs font-mono text-white/60 tracking-widest uppercase">Live on Solana Devnet</span>
          </div>

          {/* Main headline */}
          <h1 className="heading-display text-6xl md:text-8xl lg:text-9xl mb-6 animate-fade-in">
            <span className="text-white">OWN YOUR</span>
            <br />
            <span className="gradient-text">EVENT TICKET</span>
            <br />
            <span className="text-white/30">ON-CHAIN.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto mb-12 font-body leading-relaxed animate-slide-up" style={{animationDelay: "0.2s"}}>
            Tokenized tickets. Zero fraud. Instant check-in.
            On-chain proof of attendance — all powered by Solana.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{animationDelay: "0.3s"}}>
            <Link href="/events" className="btn-primary text-lg px-8 py-4 group">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              Explore Events
            </Link>
            <Link href="/dashboard/events/create" className="btn-secondary text-lg px-8 py-4 group">
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Host an Event
            </Link>
          </div>

          {/* Live Stats */}
          <LiveStats />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="badge badge-active mb-4">How It Works</div>
            <h2 className="heading-display text-5xl md:text-6xl text-white mb-4">
              Simple. Secure. <span className="gradient-text">On-Chain.</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto font-body">
              From event creation to on-chain attendance proof — everything happens transparently on Solana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-brand-600/50 via-brand-400/30 to-cyan-500/50" />

            {[
              {
                step: "01",
                title: "Create Your Event",
                description: "Define ticket tiers, set prices, configure anti-scalping rules, and deploy your event smart contract in minutes.",
                color: "from-brand-600/20 to-brand-900/0",
                icon: CalendarPlus,
                iconColor: "text-brand-400",
              },
              {
                step: "02",
                title: "Tickets Mint as NFTs",
                description: "Attendees buy or claim tickets directly to their Solana wallet. Each ticket is a verifiable on-chain asset.",
                color: "from-cyan-600/20 to-cyan-900/0",
                icon: Ticket,
                iconColor: "text-neon-cyan",
              },
              {
                step: "03",
                title: "Instant Verification",
                description: "At the gate, scan QR or verify wallet ownership. Ticket is marked used on-chain. POAP badge minted automatically.",
                color: "from-neon-green/20 to-transparent",
                icon: ShieldCheck,
                iconColor: "text-neon-green",
              },
            ].map((step, i) => (
              <div key={i} className="ticket-card p-8 group">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center shadow-lg">
                      <step.icon className={`w-7 h-7 ${step.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-5xl font-bold text-white/05">{step.step}</span>
                  </div>
                  <h3 className="font-display text-xl mb-3 text-white">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-body">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="heading-display text-5xl text-white mb-4">
              Built Different
            </h2>
            <p className="text-white/40 text-lg font-body">Every feature designed for the on-chain era.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Anti-Fraud by Design",
                description: "On-chain ownership verification means zero fake tickets. Every ticket is cryptographically signed.",
                badge: "Security",
                badgeColor: "badge-active",
                icon: ShieldCheck,
                iconColor: "text-neon-green",
              },
              {
                title: "Anti-Scalping Rules",
                description: "Set max tickets per wallet, transfer restrictions, and resale price caps directly in your smart contract.",
                badge: "Control",
                badgeColor: "badge-vip",
                icon: Lock,
                iconColor: "text-amber-400",
              },
              {
                title: "Instant Check-In",
                description: "QR scan or wallet verification — check in thousands of attendees in seconds on Solana's lightning-fast network.",
                badge: "Speed",
                badgeColor: "badge-free",
                icon: Zap,
                iconColor: "text-neon-cyan",
              },
              {
                title: "POAP Attendance Badges",
                description: "Attendees receive on-chain proof of attendance NFTs. Build loyalty programs and memories forever.",
                badge: "Engagement",
                badgeColor: "badge-vip",
                icon: Award,
                iconColor: "text-amber-400",
              },
              {
                title: "Programmable Royalties",
                description: "Earn royalties on every secondary sale. Configure resale rules and earn passively from your events.",
                badge: "Revenue",
                badgeColor: "badge-active",
                icon: DollarSign,
                iconColor: "text-neon-green",
              },
              {
                title: "Real-Time Analytics",
                description: "Track sales, revenue, check-ins, and buyer demographics in real-time. All data backed by on-chain truth.",
                badge: "Insights",
                badgeColor: "badge-free",
                icon: BarChart3,
                iconColor: "text-neon-cyan",
              },
            ].map((feature, i) => (
              <div key={i} className="ticket-card p-6 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center glass rounded-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display text-white text-lg">{feature.title}</h3>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed font-body">{feature.description}</p>
                    <span className={`badge ${feature.badgeColor} mt-3`}>{feature.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-white/30" />
            <p className="text-white/30 text-sm font-mono uppercase tracking-widest">Powered by Solana</p>
          </div>
          <div className="flex items-center justify-center gap-8 md:gap-16 opacity-40">
            <div className="text-center">
              <p className="font-display text-2xl text-white">400ms</p>
              <p className="text-xs text-white/40 mt-1">Block Time</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="font-display text-2xl text-white">$0.00025</p>
              <p className="text-xs text-white/40 mt-1">Per Transaction</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="font-display text-2xl text-white">65,000+</p>
              <p className="text-xs text-white/40 mt-1">TPS Capacity</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-strong rounded-3xl p-12 md:p-20 text-center overflow-hidden neon-border">
            <div className="absolute inset-0 bg-gradient-radial from-brand-600/20 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="heading-display text-5xl md:text-6xl text-white mb-6">
                Ready to go <span className="gradient-text">on-chain?</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto font-body">
                Join organizers building the future of events. Deploy your first tokenized event in minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard/events/create" className="btn-primary text-lg px-10 py-4 group">
                  Create Your First Event
                </Link>
                <Link href="/events" className="btn-secondary text-lg px-10 py-4">
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
