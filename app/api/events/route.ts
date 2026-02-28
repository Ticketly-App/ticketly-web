import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/client";
import { EventModel as Event } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const organizer = searchParams.get("organizer");
    const status = searchParams.get("status") || "Active";
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (status !== "all") query.status = status;
    if (category) query.categories = { $in: [category] };
    if (search) query.$text = { $search: search };
    if (organizer) query.organizerWallet = organizer;

    const [events, total] = await Promise.all([
      Event.find(query).sort({ startTime: 1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(query),
    ]);

    return NextResponse.json({ events, total, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const event = await Event.create(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
