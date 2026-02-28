export function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-8 text-xs text-muted-foreground">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <span>Ticketly · Solana devnet</span>
        <a
          href="https://github.com/solana-developers/create-solana-dapp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Built on Anchor &amp; Wallet Adapter
        </a>
      </div>
    </footer>
  )
}

