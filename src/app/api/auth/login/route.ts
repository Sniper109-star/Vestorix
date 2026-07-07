import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import {
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  verifyPassword,
} from "@/lib/auth";
import { toPublicUser } from "@/lib/types";

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL / 1000,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const user = await db.getUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSession(user.id);
    const res = NextResponse.json({ user: toPublicUser(user) });
    setSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
