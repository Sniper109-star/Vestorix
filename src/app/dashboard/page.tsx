import Link from "next/link";
import { db } from "@/lib/store";
import { getUserFromCookie } from "@/lib/auth";
import { getNativeBalance } from "@/lib/web3";
import { Card, Stat, Badge, ButtonLink } from "@/components/ui";
import { formatMoney, formatDate, shortAddress } from "@/lib/format";

export default async function OverviewPage() {
  const user = await getUserFromCookie();
  if (!user) return null;
  const full = await db.getUserById(user.id);
  const txs = await db.getUserTransactions(user.id);
  txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const approvedDeposits = txs
    .filter((t) => t.type === "deposit" && t.status === "approved")
    .reduce((s, t) => s + t.amount, 0);
  const approvedWithdrawals = txs
    .filter((t) => t.type === "withdrawal" && t.status === "approved")
    .reduce((s, t) => s + t.amount, 0);
  const pending = txs.filter((t) => t.status === "pending");

  let onChain: { eth: string } | null = null;
  if (full?.walletAddress) {
    try {
      onChain = await getNativeBalance(full.walletAddress);
    } catch {
      onChain = null;
    }
  }

  const statusTone = (s: string) =>
    s === "approved" ? "green" : s === "pending" ? "amber" : "red";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <ButtonLink href="/dashboard/deposit">Deposit</ButtonLink>
          <ButtonLink href="/dashboard/withdraw" variant="ghost">
            Withdraw
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Available balance" value={formatMoney(user.balance)} />
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
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/50">
            Recent activity
          </h3>
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

        <Card>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/50">
            On-chain wallet
          </h3>
          {full?.walletAddress ? (
            <div className="space-y-3">
              <p className="break-all font-mono text-xs text-white/60">
                {full.walletAddress}
              </p>
              <div>
                <p className="text-xs text-white/40">Native balance</p>
                <p className="text-xl font-semibold">
                  {onChain ? `${Number(onChain.eth).toFixed(4)} ETH` : "Unavailable"}
                </p>
              </div>
              <p className="text-xs text-white/30">
                Read via web3.js · {shortAddress(full.walletAddress)}
              </p>
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
      </div>
    </div>
  );
}
