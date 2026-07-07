"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { OnrampWidget } from "@/components/onramp-widget";
import { SupportedNetworks } from "@/components/chain-selector";

export default function DepositPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    amount: "",
    asset: "USDC",
    txHash: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setLoading(true);
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Deposit failed");
        return;
      }
      setDone("Deposit submitted and pending review. You'll be notified by email.");
      setForm({ amount: "", asset: "USDC", txHash: "", address: "" });
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400/60";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Deposit funds</h1>
      <OnrampWidget />
      <div className="space-y-2">
        <p className="mb-2 text-sm text-white/50">Supported networks</p>
        <SupportedNetworks />
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-white/70">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={field}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="100.00"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Asset</label>
              <select
                className={field}
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: e.target.value })}
              >
                <option>USDC</option>
                <option>USDT</option>
                <option>ETH</option>
                <option>BTC</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">
              Transaction hash <span className="text-white/30">(optional)</span>
            </label>
            <input
              className={field}
              value={form.txHash}
              onChange={(e) => setForm({ ...form, txHash: e.target.value })}
              placeholder="0x…"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">
              Sending address <span className="text-white/30">(optional)</span>
            </label>
            <input
              className={field}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="0x…"
            />
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          {done && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{done}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit deposit"}
          </button>
        </form>
      </Card>
    </div>
  );
}
