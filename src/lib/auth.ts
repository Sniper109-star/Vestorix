import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "./store";
import { hashPassword, verifyPassword } from "./password";
import { toPublicUser, type PublicUser, type User } from "./types";

export { hashPassword, verifyPassword };
export const SESSION_COOKIE = "inv_session";
export const SESSION_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = newToken();
  await db.createSession({
    token,
    userId,
    expiresAt: Date.now() + SESSION_TTL,
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.deleteSession(token);
}

export async function getUserFromCookie(): Promise<PublicUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.getSession(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    await db.deleteSession(token);
    return null;
  }
  const user = await db.getUserById(session.userId);
  if (!user) return null;
  return toPublicUser(user);
}

export async function getFullUserFromCookie(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.getSession(token);
  if (!session || session.expiresAt < Date.now()) return null;
  return db.getUserById(session.userId);
}

export function assertUser(user: PublicUser | null): PublicUser {
  if (!user) throw new AuthError("Not authenticated");
  return user;
}

export function assertAdmin(user: PublicUser | null): PublicUser {
  if (!user) throw new AuthError("Not authenticated");
  if (user.role !== "admin") throw new AuthError("Admin access required");
  return user;
}

export class AuthError extends Error {}
