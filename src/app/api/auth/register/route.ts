import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/store";
import { createSession, hashPassword, SESSION_COOKIE, SESSION_TTL } from "@/lib/auth";
import { toPublicUser, type User } from "@/lib/types";

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
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const walletAddress = body.walletAddress
      ? String(body.walletAddress).trim()
      : null;

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ error: "Name is too short" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user: User = {
      id: randomUUID(),
      email,
      name,
      passwordHash,
      role: "user",
      walletAddress,
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    await db.createUser(user);

    const token = await createSession(user.id);
    const res = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
    setSessionCookie(res, token);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
