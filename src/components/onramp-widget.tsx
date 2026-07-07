"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export function OnrampWidget({ walletAddress }: { walletAddress?: string | null }) {
  const [provider, setProvider] = useState<"coinbase" | "stripe">("coinbase");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("USDC");
  const [address, setAddress] = useState(walletAddress ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Enter a valid wallet address");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/onramp/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          walletAddress: address,
          asset,
          amount: amount || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start on-ramp");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400/60";

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/50">
        Buy crypto (fiat on-ramp)
      </h3>
      <form onSubmit={start} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-white/70">Provider</label>
          <select className={field} value={provider} onChange={(e) => setProvider(e.target.value as "coinbase" | "stripe")}>
            <option value="coinbase">Coinbase Onramp</option>
            <option value="stripe">Stripe Crypto Onramp</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Destination wallet</label>
          <input className={field} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x…" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">Asset</label>
            <select className={field} value={asset} onChange={(e) => setAsset(e.target.value)}>
              <option>USDC</option>
              <option>USDT</option>
              <option>ETH</option>
              <option>BTC</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Amount (USD)</label>
            <input className={field} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" type="number" min="0" />
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {busy ? "Redirecting…" : "Continue to on-ramp"}
        </button>
      </form>
    </Card>
  );
}
