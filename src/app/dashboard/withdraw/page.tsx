"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";

export default function WithdrawPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [form, setForm] = useState({ amount: "", asset: "USDC", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Withdrawal failed");
        return;
      }
      setDone("Withdrawal requested and pending review. You'll be notified by email.");
      setForm({ amount: "", asset: "USDC", address: "" });
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
      <h1 className="text-2xl font-bold">Withdraw funds</h1>
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
                placeholder="50.00"
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
            <label className="mb-1 block text-sm text-white/70">Withdrawal address</label>
            <input
              className={field}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="0x…"
              required
            />
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          {done && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{done}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Request withdrawal"}
          </button>
        </form>
      </Card>
      <p className="text-center text-xs text-white/40">
        Withdrawals are reviewed by our team before funds leave the treasury.
      </p>
    </div>
  );
}
