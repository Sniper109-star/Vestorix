import { db } from "../src/lib/store";
import { hashPassword } from "../src/lib/password";
import type { User } from "../src/lib/types";
import { randomUUID } from "crypto";

async function ensureUser(
  email: string,
  name: string,
  password: string,
  role: User["role"],
): Promise<void> {
  const existing = await db.getUserByEmail(email);
  if (existing) {
    console.log(`• ${email} already exists (${role})`);
    return;
  }
  const passwordHash = await hashPassword(password);
  const user: User = {
    id: randomUUID(),
    email,
    name,
    passwordHash,
    role,
    walletAddress: null,
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  await db.createUser(user);
  console.log(`✓ created ${email} (${role})`);
}

async function main() {
  await ensureUser(
    process.env.ADMIN_EMAIL ?? "admin@invest.app",
    "Platform Admin",
    process.env.ADMIN_PASSWORD ?? "Admin@1234",
    "admin",
  );
  await ensureUser(
    process.env.USER_EMAIL ?? "user@invest.app",
    "Demo Investor",
    process.env.USER_PASSWORD ?? "User@1234",
    "user",
  );
  console.log("\nSeed complete.");
  console.log("  Admin : admin@invest.app / Admin@1234");
  console.log("  User  : user@invest.app / User@1234");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
