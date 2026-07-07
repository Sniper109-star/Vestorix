import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { assertAdmin, getUserFromCookie } from "@/lib/auth";
import { notifyDepositApproved, notifyWithdrawalApproved } from "@/lib/email";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const admin = assertAdmin(await getUserFromCookie());
    const { id } = await ctx.params;
    const body = await req.json();
    const action = String(body.action ?? "");

    const tx = await db.getTransactionById(id);
    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    if (tx.status !== "pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 409 });
    }

    const user = await db.getUserById(tx.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "reject") {
      const updated = await db.updateTransaction(id, {
        status: "rejected",
        processedAt: new Date().toISOString(),
        processedBy: admin.id,
        note: body.note ? String(body.note) : null,
      });
      return NextResponse.json({ transaction: updated });
    }

    if (action !== "approve") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (tx.type === "deposit") {
      await db.updateUser(user.id, {
        balance: Math.round((user.balance + tx.amount) * 100) / 100,
      });
    } else if (tx.type === "withdrawal") {
      if (user.balance < tx.amount) {
        return NextResponse.json(
          { error: "User has insufficient balance" },
          { status: 400 },
        );
      }
      await db.updateUser(user.id, {
        balance: Math.round((user.balance - tx.amount) * 100) / 100,
      });
    }

    const updated = await db.updateTransaction(id, {
      status: "approved",
      processedAt: new Date().toISOString(),
      processedBy: admin.id,
      note: body.note ? String(body.note) : null,
    });

    if (tx.type === "deposit") {
      await notifyDepositApproved(user.email, tx.amount, tx.asset).catch(() => {});
    } else {
      await notifyWithdrawalApproved(
        user.email,
        tx.amount,
        tx.asset,
        tx.address ?? "",
      ).catch(() => {});
    }

    return NextResponse.json({ transaction: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
  }
}
