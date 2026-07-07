export type Role = "user" | "admin";
export type TxStatus = "pending" | "approved" | "rejected";
export type TxType = "deposit" | "withdrawal";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  walletAddress: string | null;
  balance: number;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  amount: number;
  asset: string;
  status: TxStatus;
  txHash: string | null;
  address: string | null;
  note: string | null;
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
}

export type PublicUser = Omit<User, "passwordHash" | "passwordSalt">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}
