import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
            <Link href="/events" className="btn-primary text-lg px-8 py-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              Explore Events
            </Link>
            <Link href="/dashboard/events/create" className="btn-secondary text-lg px-8 py-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
              </svg>
              Host an Event
            </Link>
          </div>

          {/* Stats ticker */}
          <div className="mt-20 glass rounded-2xl p-6 max-w-4xl mx-auto animate-fade-in" style={{animationDelay: "0.5s"}}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "0% Fraud", label: "Verified on-chain" },
                { value: "<1s", label: "Check-in speed" },
                { value: "0.00025", label: "SOL per tx" },
                { value: "\u221E", label: "Programmable rules" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-display text-brand-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-white/40 uppercase tracking-widest font-mono">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
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
                iconPath: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
              },
              {
                step: "02",
                title: "Tickets Mint as NFTs",
                description: "Attendees buy or claim tickets directly to their Solana wallet. Each ticket is a verifiable on-chain asset.",
                color: "from-cyan-600/20 to-cyan-900/0",
                iconPath: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
              },
              {
                step: "03",
                title: "Instant Verification",
                description: "At the gate, scan QR or verify wallet ownership. Ticket is marked used on-chain. POAP badge minted automatically.",
                color: "from-neon-green/20 to-transparent",
                iconPath: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
              },
            ].map((step, i) => (
              <div key={i} className="ticket-card p-8 group">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400">
                        <path d={step.iconPath} />
                      </svg>
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
                iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
              },
              {
                title: "Anti-Scalping Rules",
                description: "Set max tickets per wallet, transfer restrictions, and resale price caps directly in your smart contract.",
                badge: "Control",
                badgeColor: "badge-vip",
                iconPath: "M18.36 6.64A9 9 0 0 1 20.77 15M5.64 6.64A9 9 0 0 0 3.23 15M12 2v4M2 12h4M18 12h4M12 18v4M6 18l2-2M16 18l2 2",
              },
              {
                title: "Instant Check-In",
                description: "QR scan or wallet verification — check in thousands of attendees in seconds on Solana's lightning-fast network.",
                badge: "Speed",
                badgeColor: "badge-free",
                iconPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
              },
              {
                title: "POAP Attendance Badges",
                description: "Attendees receive on-chain proof of attendance NFTs. Build loyalty programs and memories forever.",
                badge: "Engagement",
                badgeColor: "badge-vip",
                iconPath: "M6 9H4.5a2.5 2.5 0 0 1 0-5C6 4 8 5.5 8 5.5S10 4 11.5 4a2.5 2.5 0 0 1 0 5H12M12 9v12M8 13h8M7 17h10",
              },
              {
                title: "Programmable Royalties",
                description: "Earn royalties on every secondary sale. Configure resale rules and earn passively from your events.",
                badge: "Revenue",
                badgeColor: "badge-active",
                iconPath: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
              },
              {
                title: "Real-Time Analytics",
                description: "Track sales, revenue, check-ins, and buyer demographics in real-time. All data backed by on-chain truth.",
                badge: "Insights",
                badgeColor: "badge-free",
                iconPath: "M18 20V10M12 20V4M6 20v-6",
              },
            ].map((feature, i) => (
              <div key={i} className="ticket-card p-6 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center glass rounded-xl flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400">
                      <path d={feature.iconPath} />
                    </svg>
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
                <Link href="/dashboard/events/create" className="btn-primary text-lg px-10 py-4">
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
