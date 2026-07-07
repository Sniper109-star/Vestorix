import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { assertAdmin, getUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    assertAdmin(await getUserFromCookie());
    const [users, txs] = await Promise.all([db.getUsers(), db.getTransactions()]);
    const totalBalance = users.reduce((s, u) => s + u.balance, 0);
    const approvedDeposits = txs
      .filter((t) => t.type === "deposit" && t.status === "approved")
      .reduce((s, t) => s + t.amount, 0);
    const approvedWithdrawals = txs
      .filter((t) => t.type === "withdrawal" && t.status === "approved")
      .reduce((s, t) => s + t.amount, 0);
    const pendingTxs = txs.filter((t) => t.status === "pending");
    return NextResponse.json({
      users: users.length,
      totalBalance: Math.round(totalBalance * 100) / 100,
      depositsApproved: Math.round(approvedDeposits * 100) / 100,
      withdrawalsApproved: Math.round(approvedWithdrawals * 100) / 100,
      pending: pendingTxs.length,
      pendingAmount:
        Math.round(pendingTxs.reduce((s, t) => s + t.amount, 0) * 100) / 100,
    });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
