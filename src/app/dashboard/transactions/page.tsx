import { getUserFromCookie } from "@/lib/auth";
import { db } from "@/lib/store";
import { Card, Badge } from "@/components/ui";
import { formatMoney, formatDate, shortAddress } from "@/lib/format";

export default async function TransactionsPage() {
  const user = await getUserFromCookie();
  if (!user) return null;
  const txs = await db.getUserTransactions(user.id);
  txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const tone = (s: string) =>
    s === "approved" ? "green" : s === "pending" ? "amber" : "red";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <Card className="!p-0">
        {txs.length === 0 ? (
          <p className="p-8 text-center text-sm text-white/40">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-white/40">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/60">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3 capitalize">{t.type}</td>
                    <td className="px-4 py-3">{t.asset}</td>
                    <td className="px-4 py-3 font-medium">
                      {t.type === "withdrawal" ? "-" : "+"}
                      {formatMoney(t.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-white/50">
                      {t.address ? shortAddress(t.address) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={tone(t.status) as never}>{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
