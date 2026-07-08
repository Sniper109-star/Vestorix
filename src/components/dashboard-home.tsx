"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { Card, Stat, Badge, ButtonLink } from "@/components/ui";
import { WalletConnectButton } from "@/components/wallet-connect";
import { PriceTicker } from "@/components/price-ticker";
import { formatMoney, formatDate, shortAddress } from "@/lib/format";
import type { PublicUser, Transaction } from "@/lib/types";

const CONVEX_ENABLED = !!process.env.NEXT_PUBLIC_CONVEX_URL;

export function DashboardHome({ user }: { user: PublicUser }) {
  if (!CONVEX_ENABLED) return <DashboardConfigNotice />;
  return <DashboardRealtime user={user} />;
}

function DashboardConfigNotice() {
  return (
    <Card>
      <h3 className="mb-2 text-lg font-semibold">Real-time backend not configured</h3>
      <p className="text-sm text-white/60">
        The dashboard reads live data from Convex. Set{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
          NEXT_PUBLIC_CONVEX_URL
        </code>{" "}
        (and <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">CONVEX_DEPLOYMENT_URL</code>) and run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">npx convex dev</code> to enable real-time data.
      </p>
      <div className="mt-4 flex gap-2">
        <ButtonLink href="/dashboard/deposit">Deposit</ButtonLink>
        <ButtonLink href="/dashboard/withdraw" variant="ghost">Withdraw</ButtonLink>
      </div>
    </Card>
  );
}

function DashboardRealtime({ user }: { user: PublicUser }) {
  const liveUser = useQuery(api.users.getById, { id: user.id });
  const txRows = useQuery(api.transactions.listUser, { userId: user.id });

  const [onChain, setOnChain] = useState<{ eth: string } | null>(null);

  const wallet = liveUser?.walletAddress ?? user.walletAddress ?? null;
  const balance = liveUser?.balance ?? user.balance;

  const txs = ((txRows ?? []) as Transaction[])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const approvedDeposits = txs
    .filter((t) => t.type === "deposit" && t.status === "approved")
    .reduce((s, t) => s + t.amount, 0);
  const approvedWithdrawals = txs
    .filter((t) => t.type === "withdrawal" && t.status === "approved")
    .reduce((s, t) => s + t.amount, 0);
  const pending = txs.filter((t) => t.status === "pending");

  useEffect(() => {
    if (!wallet) return;
    let active = true;
    fetch(`/api/web3/balance?address=${wallet}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) setOnChain(d ?? null);
      })
      .catch(() => active && setOnChain(null));
    return () => {
      active = false;
    };
  }, [wallet]);

  const statusTone = (s: string) =>
    s === "approved" ? "green" : s === "pending" ? "amber" : "red";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <ButtonLink href="/dashboard/deposit">Deposit</ButtonLink>
          <ButtonLink href="/dashboard/withdraw" variant="ghost">
            Withdraw
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Available balance" value={formatMoney(balance)} />
        <Stat label="Total deposited" value={formatMoney(approvedDeposits)} hint="Approved deposits" />
        <Stat label="Total withdrawn" value={formatMoney(approvedWithdrawals)} hint="Approved withdrawals" />
        <Stat
          label="Pending"
          value={pending.length}
          hint={formatMoney(pending.reduce((s, t) => s + t.amount, 0)) + " in review"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-white/50">
              Recent activity
            </h3>
            <WalletConnectButton />
          </div>
          {txs.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">
              No transactions yet. Make your first{" "}
              <Link href="/dashboard/deposit" className="text-emerald-300 underline">
                deposit
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {txs.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {t.type} · {t.asset}
                    </p>
                    <p className="text-xs text-white/40">{formatDate(t.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {t.type === "withdrawal" ? "-" : "+"}
                      {formatMoney(t.amount)}
                    </span>
                    <Badge tone={statusTone(t.status) as never}>{t.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {txs.length > 6 && (
            <div className="mt-3 text-right">
              <Link href="/dashboard/transactions" className="text-sm text-emerald-300 hover:underline">
                View all →
              </Link>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/50">
              On-chain wallet
            </h3>
            {wallet ? (
              <div className="space-y-3">
                <p className="break-all font-mono text-xs text-white/60">{wallet}</p>
                <div>
                  <p className="text-xs text-white/40">Native balance</p>
                  <p className="text-xl font-semibold">
                    {onChain ? `${Number(onChain.eth).toFixed(4)} ETH` : "Loading…"}
                  </p>
                </div>
                <p className="text-xs text-white/30">{shortAddress(wallet)}</p>
              </div>
            ) : (
              <p className="text-sm text-white/40">
                No wallet linked. Add one in your{" "}
                <Link href="/dashboard/profile" className="text-emerald-300 underline">
                  profile
                </Link>
                .
              </p>
            )}
          </Card>
          <PriceTicker />
        </div>
      </div>
    </div>
  );
}
