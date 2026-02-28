import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/client'
import { TicketModel } from '@/lib/db/models'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()

    // Try finding by pubkey first, then by MongoDB _id
    let ticket = await TicketModel.findOne({ pubkey: id }).lean()
    if (!ticket) {
      ticket = await TicketModel.findById(id).lean().catch(() => null)
    }

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()
    const body = await req.json()

    const ticket = await TicketModel.findOneAndUpdate({ pubkey: id }, body, { new: true })
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
