import { Connection, PublicKey } from '@solana/web3.js'
import { BorshAccountsCoder } from '@coral-xyz/anchor'
import { TICKETLY_IDL } from '../src/lib/ticketly/idl-raw'

function parseBnValue(val: any): number {
  if (val == null) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'bigint') return Number(val)
  if (typeof val.toNumber === 'function') return val.toNumber()
  return Number(val.toString()) || 0
}

async function main() {
  const conn = new Connection('https://api.devnet.solana.com', 'confirmed')
  const programId = new PublicKey('GawjtcQFx5cnK24VrDiUhGdg4DZbVGLzsSsd4vbxznfs')
  const disc = Buffer.from([98, 136, 32, 165, 133, 231, 243, 154])

  const accounts = await conn.getProgramAccounts(programId, {
    filters: [{ memcmp: { offset: 0, bytes: disc.toString('base64'), encoding: 'base64' } }],
  })

  console.log('EventAccount count:', accounts.length)

  const coder = new BorshAccountsCoder(TICKETLY_IDL as any)
  let totalEvents = 0
  let totalMinted = 0
  let totalRevenue = 0
  let totalCheckedIn = 0

  for (const { account } of accounts) {
    const decoded: any = coder.decode('EventAccount', account.data)
    if (decoded.is_cancelled) continue

    const minted = parseBnValue(decoded.total_minted)
    const revenue = parseBnValue(decoded.total_revenue)
    const checkedIn = parseBnValue(decoded.total_checked_in)

    console.log(`Event: ${decoded.name} | minted: ${minted} | revenue: ${revenue} lamports | checkedIn: ${checkedIn}`)

    totalEvents++
    totalMinted += minted
    totalRevenue += revenue
    totalCheckedIn += checkedIn
  }
  console.log('---')
  console.log('Total Events:', totalEvents)
  console.log('Total Tickets Sold:', totalMinted)
  console.log('Total Revenue (SOL):', totalRevenue / 1_000_000_000)
  console.log('Total Checked In:', totalCheckedIn)
}

main().catch(console.error)
