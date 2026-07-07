import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { assertUser, getUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const user = assertUser(await getUserFromCookie());
    const txs = await db.getUserTransactions(user.id);
    txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ transactions: txs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}
