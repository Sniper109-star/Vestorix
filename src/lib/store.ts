import { promises as fs } from "fs";
import path from "path";
import type { Session, Transaction, User } from "./types";

interface DBShape {
  users: User[];
  sessions: Session[];
  transactions: Transaction[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const EMPTY: DBShape = { users: [], sessions: [], transactions: [] };

async function readDB(): Promise<DBShape> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DBShape>;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      transactions: parsed.transactions ?? [],
    };
  } catch {
    return { ...EMPTY };
  }
}

async function writeDB(db: DBShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

async function mutate<T>(fn: (db: DBShape) => T): Promise<T> {
  const db = await readDB();
  const result = fn(db);
  await writeDB(db);
  return result;
}

export const db = {
  // --- Users ---
  getUsers: () => readDB().then((d) => d.users),
  getUserById: (id: string) =>
    readDB().then((d) => d.users.find((u) => u.id === id) ?? null),
  getUserByEmail: (email: string) =>
    readDB().then((d) => d.users.find((u) => u.email === email) ?? null),
  createUser: (user: User) =>
    mutate((d) => {
      d.users.push(user);
      return user;
    }),
  updateUser: (id: string, patch: Partial<User>) =>
    mutate((d) => {
      const u = d.users.find((x) => x.id === id);
      if (!u) return null;
      Object.assign(u, patch);
      return u;
    }),

  // --- Sessions ---
  getSession: (token: string) =>
    readDB().then((d) => d.sessions.find((s) => s.token === token) ?? null),
  createSession: (session: Session) =>
    mutate((d) => {
      d.sessions.push(session);
      return session;
    }),
  deleteSession: (token: string) =>
    mutate((d) => {
      d.sessions = d.sessions.filter((s) => s.token !== token);
      return true;
    }),

  // --- Transactions ---
  getTransactions: () => readDB().then((d) => d.transactions),
  getUserTransactions: (userId: string) =>
    readDB().then((d) =>
      d.transactions.filter((t) => t.userId === userId),
    ),
  getTransactionById: (id: string) =>
    readDB().then((d) => d.transactions.find((t) => t.id === id) ?? null),
  createTransaction: (tx: Transaction) =>
    mutate((d) => {
      d.transactions.push(tx);
      return tx;
    }),
  updateTransaction: (id: string, patch: Partial<Transaction>) =>
    mutate((d) => {
      const t = d.transactions.find((x) => x.id === id);
      if (!t) return null;
      Object.assign(t, patch);
      return t;
    }),
};
