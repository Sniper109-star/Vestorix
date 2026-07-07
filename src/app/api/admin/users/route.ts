import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { assertAdmin, getUserFromCookie } from "@/lib/auth";
import { toPublicUser } from "@/lib/types";

export async function GET() {
  try {
    const admin = assertAdmin(await getUserFromCookie());
    const users = await db.getUsers();
    const transactions = await db.getTransactions();
    const enriched = users.map((u) => {
      const userTxs = transactions.filter((t) => t.userId === u.id);
      return {
        ...toPublicUser(u),
        txCount: userTxs.length,
        pending: userTxs.filter((t) => t.status === "pending").length,
      };
    });
    enriched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ users: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
