import { Connection } from '@solana/web3.js'

const connections = new Map<string, Connection>()

export function getConnection(endpoint: string) {
  const existing = connections.get(endpoint)
  if (existing) return existing
  const connection = new Connection(endpoint, 'confirmed')
  connections.set(endpoint, connection)
  return connection
}

