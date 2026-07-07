import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";
import { assertUser, getUserFromCookie } from "@/lib/auth";
import type { Transaction } from "@/lib/types";
import { notifyWithdrawalRequested } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const user = assertUser(await getUserFromCookie());
    const body = await req.json();
    const amount = Number(body.amount);
    const asset = String(body.asset ?? "USDC").toUpperCase();
    const address = String(body.address ?? "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Enter a valid withdrawal address" }, { status: 400 });
    }

    const full = await db.getUserById(user.id);
    if (!full || full.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const tx: Transaction = {
      id: randomUUID(),
      userId: user.id,
      type: "withdrawal",
      amount: Math.round(amount * 100) / 100,
      asset,
      status: "pending",
      txHash: null,
      address,
      note: null,
      createdAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
    };
    await db.createTransaction(tx);
    await notifyWithdrawalRequested(user.email, tx.amount, tx.asset).catch(() => {});
    return NextResponse.json({ transaction: tx }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Withdrawal request failed" }, { status: 500 });
  }
}
