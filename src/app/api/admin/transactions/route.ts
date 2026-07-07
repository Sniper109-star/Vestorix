import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { assertAdmin, getUserFromCookie } from "@/lib/auth";
import { toPublicUser } from "@/lib/types";

export async function GET(req: Request) {
  try {
    assertAdmin(await getUserFromCookie());
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const all = await db.getTransactions();
    const users = await db.getUsers();
    const byId = new Map(users.map((u) => [u.id, toPublicUser(u)]));
    let txs = all;
    if (status) txs = txs.filter((t) => t.status === status);
    txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const enriched = txs.map((t) => ({ ...t, user: byId.get(t.userId) ?? null }));
    return NextResponse.json({ transactions: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
