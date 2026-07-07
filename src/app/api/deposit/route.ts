import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";
import { assertUser, getUserFromCookie } from "@/lib/auth";
import type { Transaction } from "@/lib/types";
import { notifyDepositSubmitted } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const user = assertUser(await getUserFromCookie());
    const body = await req.json();
    const amount = Number(body.amount);
    const asset = String(body.asset ?? "USDC").toUpperCase();
    const txHash = body.txHash ? String(body.txHash).trim() : null;
    const address = body.address ? String(body.address).trim() : null;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    if (txHash && !/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
      return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
    }

    const tx: Transaction = {
      id: randomUUID(),
      userId: user.id,
      type: "deposit",
      amount: Math.round(amount * 100) / 100,
      asset,
      status: "pending",
      txHash,
      address,
      note: null,
      createdAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
    };
    await db.createTransaction(tx);
    await notifyDepositSubmitted(user.email, tx.amount, tx.asset).catch(() => {});
    return NextResponse.json({ transaction: tx }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Deposit failed" }, { status: 500 });
  }
}
