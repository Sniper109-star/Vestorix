import { getConvex } from "./convexServer";
import type { Session, Transaction, User } from "./types";
import { api } from "../../convex/_generated/api";

interface ConvexUserDoc {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "user" | "admin";
  walletAddress: string | null;
  balance: number;
  createdAt: string;
}

interface ConvexSessionDoc {
  _id: string;
  token: string;
  userId: string;
  expiresAt: number;
}

interface ConvexTxDoc {
  _id: string;
  userId: string;
  type: "deposit" | "withdrawal";
  amount: number;
  asset: string;
  status: "pending" | "approved" | "rejected";
  txHash: string | null;
  address: string | null;
  note: string | null;
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
}

function mapUser(d: ConvexUserDoc): User {
  return {
    id: d._id,
    email: d.email,
    name: d.name,
    passwordHash: d.passwordHash,
    role: d.role,
    walletAddress: d.walletAddress,
    balance: d.balance,
    createdAt: d.createdAt,
  };
}

function mapSession(d: ConvexSessionDoc): Session {
  return { token: d.token, userId: d.userId, expiresAt: d.expiresAt };
}

function mapTx(d: ConvexTxDoc): Transaction {
  return {
    id: d._id,
    userId: d.userId,
    type: d.type,
    amount: d.amount,
    asset: d.asset,
    status: d.status,
    txHash: d.txHash,
    address: d.address,
    note: d.note,
    createdAt: d.createdAt,
    processedAt: d.processedAt,
    processedBy: d.processedBy,
  };
}

export const db = {
  // --- Users ---
  getUsers: async (): Promise<User[]> =>
    (await getConvex().query(api.users.list, {})).map(mapUser),
  getUserById: async (id: string): Promise<User | null> => {
    const d = await getConvex().query(api.users.getById, { id });
    return d ? mapUser(d as ConvexUserDoc) : null;
  },
  getUserByEmail: async (email: string): Promise<User | null> => {
    const d = await getConvex().query(api.users.getByEmail, { email });
    return d ? mapUser(d as ConvexUserDoc) : null;
  },
  createUser: async (user: User): Promise<User> => {
    const id = await getConvex().mutation(api.users.create, {
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role,
      walletAddress: user.walletAddress,
      balance: user.balance,
      createdAt: user.createdAt,
    });
    const d = await getConvex().query(api.users.getById, { id });
    return mapUser(d as ConvexUserDoc);
  },
  updateUser: async (id: string, patch: Partial<User>): Promise<User | null> => {
    const d = await getConvex().mutation(api.users.update, { id, patch });
    return d ? mapUser(d as ConvexUserDoc) : null;
  },

  // --- Sessions ---
  getSession: async (token: string): Promise<Session | null> => {
    const d = await getConvex().query(api.sessions.get, { token });
    return d ? mapSession(d as ConvexSessionDoc) : null;
  },
  createSession: async (session: Session): Promise<Session> => {
    await getConvex().mutation(api.sessions.create, {
      token: session.token,
      userId: session.userId,
      expiresAt: session.expiresAt,
    });
    return session;
  },
  deleteSession: async (token: string): Promise<boolean> => {
    await getConvex().mutation(api.sessions.remove, { token });
    return true;
  },

  // --- Transactions ---
  getTransactions: async (): Promise<Transaction[]> =>
    (await getConvex().query(api.transactions.list, {})).map(
      (d: any) => mapTx(d as ConvexTxDoc),
    ),
  getUserTransactions: async (userId: string): Promise<Transaction[]> =>
    (await getConvex().query(api.transactions.listUser, { userId })).map(
      (d: any) => mapTx(d as ConvexTxDoc),
    ),
  getTransactionById: async (id: string): Promise<Transaction | null> => {
    const d = await getConvex().query(api.transactions.get, { id });
    return d ? mapTx(d as ConvexTxDoc) : null;
  },
  createTransaction: async (tx: Transaction): Promise<Transaction> => {
    const id = await getConvex().mutation(api.transactions.create, {
      userId: tx.userId,
      type: tx.type,
      amount: tx.amount,
      asset: tx.asset,
      status: tx.status,
      txHash: tx.txHash,
      address: tx.address,
      note: tx.note,
      createdAt: tx.createdAt,
      processedAt: tx.processedAt,
      processedBy: tx.processedBy,
    });
    const d = await getConvex().query(api.transactions.get, { id });
    return mapTx(d as ConvexTxDoc);
  },
  updateTransaction: async (
    id: string,
    patch: Partial<Transaction>,
  ): Promise<Transaction | null> => {
    const d = await getConvex().mutation(api.transactions.update, { id, patch });
    return d ? mapTx(d as ConvexTxDoc) : null;
  },
};
