import { NextResponse } from "next/server";
import { getNativeBalance } from "@/lib/web3";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }
  try {
    const balance = await getNativeBalance(address);
    return NextResponse.json(balance);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read balance";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
