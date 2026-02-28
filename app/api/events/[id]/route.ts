import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/client";
import { EventModel as Event } from "@/lib/db/models";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDB();
    // Try finding by pubkey first, then by MongoDB _id
    let event = await Event.findOne({ pubkey: id }).lean();
    if (!event) {
      event = await Event.findById(id).lean().catch(() => null);
    }
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    // Increment view count
    await Event.updateOne({ _id: event._id }, { $inc: { viewCount: 1 } });
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDB();
    const body = await req.json();
    // Try updating by pubkey first, then by _id
    let event = await Event.findOneAndUpdate({ pubkey: id }, body, { new: true });
    if (!event) {
      event = await Event.findByIdAndUpdate(id, body, { new: true }).catch(() => null);
    }
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDB();
    // Try by pubkey first, then by _id
    let result = await Event.findOneAndUpdate({ pubkey: id }, { status: "Cancelled" });
    if (!result) {
      await Event.findByIdAndUpdate(id, { status: "Cancelled" }).catch(() => null);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}