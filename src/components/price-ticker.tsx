"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import type { PriceFeed } from "@/lib/integrations/price-oracle";

export function PriceTicker() {
  const [feeds, setFeeds] = useState<PriceFeed[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/prices");
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(data.error ?? "Failed to load prices");
          return;
        }
        setFeeds(data.feeds ?? []);
      } catch {
        if (active) setError("Network error");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wide text-white/50">
          Market prices
        </h3>
        <span className="text-xs text-white/30">Chainlink</span>
      </div>
      {loading && <p className="text-sm text-white/40">Loading…</p>}
      {error && <p className="text-sm text-amber-300">{error}</p>}
      {!loading && !error && feeds.length === 0 && (
        <p className="text-sm text-white/40">No price feeds available.</p>
      )}
      <ul className="divide-y divide-white/5">
        {feeds.map((f) => (
          <li key={`${f.chainId}-${f.asset}`} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">{f.asset}</p>
              <p className="text-xs text-white/40">{f.chainName}</p>
            </div>
            <p className="font-mono text-sm">
              {f.price > 0 ? `$${f.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
