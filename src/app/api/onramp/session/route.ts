import { NextResponse } from "next/server";
import { createOnrampSession, type OnrampProvider } from "@/lib/integrations/onramp";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { provider, walletAddress, asset, amount, redirectUrl } = (body ?? {}) as Record<string, string>;
  const validProviders: OnrampProvider[] = ["coinbase", "stripe"];
  if (!provider || !validProviders.includes(provider as OnrampProvider)) {
    return NextResponse.json({ error: "provider must be 'coinbase' or 'stripe'" }, { status: 400 });
  }
  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: "walletAddress is required and must be valid" }, { status: 400 });
  }

  try {
    const result = await createOnrampSession({
      provider: provider as OnrampProvider,
      walletAddress,
      asset,
      amount,
      redirectUrl,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "On-ramp unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
