import { NextResponse } from "next/server";
import { getAllPriceFeeds } from "@/lib/integrations/price-oracle";

export const revalidate = 15;

export async function GET() {
  try {
    const feeds = await getAllPriceFeeds();
    return NextResponse.json({ feeds });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read price feeds";
    return NextResponse.json({ error: message, feeds: [] }, { status: 502 });
  }
}
