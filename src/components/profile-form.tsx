"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import type { PublicUser } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [walletAddress, setWalletAddress] = useState(user.walletAddress ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, walletAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      setSaved(true);
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
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-white/70">Full name</label>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Email</label>
          <input className={`${field} opacity-60`} value={user.email} disabled />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">
            Wallet address <span className="text-white/30">(optional)</span>
          </label>
          <input
            className={field}
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x…"
          />
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2.5 text-sm">
          <span className="text-white/50">Account balance: </span>
          <span className="font-semibold text-emerald-300">{formatMoney(user.balance)}</span>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        {saved && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Profile saved.</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Card>
  );
}
