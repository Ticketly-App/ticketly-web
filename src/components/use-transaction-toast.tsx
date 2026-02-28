import { ReactNode } from 'react'
import { toast } from 'sonner'
import { ExplorerLink } from './cluster/cluster-ui'

export function useTransactionToast() {
  return (signature: string) => {
    toast('Transaction sent', {
      description: <ExplorerLink path={`tx/${signature}`} label="View Transaction" />,
    })
  }
}

/** Returns JSX showing `Sig: <clickable sliced sig>` that links to Solana Explorer. */
export function sigDescription(sig: string): ReactNode {
  return (
    <span>
      Sig:{' '}
      <ExplorerLink
        path={`tx/${sig}`}
        label={`${sig.slice(0, 20)}...`}
        className="underline decoration-dotted cursor-pointer"
      />
    </span>
  )
}
