import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { assertUser, getUserFromCookie } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const user = assertUser(await getUserFromCookie());
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      patch.name = body.name.trim();
    }
    if (body.walletAddress !== undefined) {
      const addr = String(body.walletAddress).trim();
      if (addr && !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
      }
      patch.walletAddress = addr || null;
    }
    // Allow adjusting balance only via admin; ignore balance here.
    const updated = await db.updateUser(user.id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 400 });
    }
    const { passwordHash: _ph, ...rest } = updated;
    return NextResponse.json({ user: rest });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
