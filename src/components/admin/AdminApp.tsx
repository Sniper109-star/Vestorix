"use client";

import { useEffect, useState } from "react";
import {
  Admin,
  Resource,
  List,
  Datagrid,
  TextField,
  EmailField,
  NumberField,
  DateField,
  FunctionField,
  useRecordContext,
  useNotify,
  useRefresh,
  TopToolbar,
  Title,
  Button,
  type AuthProvider,
} from "react-admin";
import { adminDataProvider } from "@/lib/admin-data-provider";

/* ----------------------------- Auth (pass-through) ----------------------------- */
const authProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => {
    return fetch("/api/auth/logout", { method: "POST" }).then(() => {
      if (typeof window !== "undefined") window.location.href = "/login";
    });
  },
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

/* ------------------------------- Dashboard ------------------------------- */
function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const cards = stats
    ? [
        { label: "Users", value: stats.users },
        { label: "Total balance", value: `$${stats.totalBalance.toLocaleString()}` },
        { label: "Deposits approved", value: `$${stats.depositsApproved.toLocaleString()}` },
        { label: "Withdrawals paid", value: `$${stats.withdrawalsApproved.toLocaleString()}` },
        { label: "Pending", value: stats.pending },
        { label: "Pending amount", value: `$${stats.pendingAmount.toLocaleString()}` },
      ]
    : [];

  return (
    <div style={{ padding: 16 }}>
      <Title title="Admin Dashboard" />
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 16px" }}>
        Platform overview
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>
      {!stats && <p style={{ marginTop: 16 }}>Loading…</p>}
    </div>
  );
}

/* ------------------------------- User list ------------------------------- */
export const UserList = () => (
  <List resource="users" exporter={false} perPage={25}>
    <Datagrid rowClick={false}>
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="role" />
      <NumberField
        source="balance"
        options={{ style: "currency", currency: "USD" }}
      />
      <NumberField source="txCount" label="Txns" />
      <FunctionField
        label="Wallet"
        render={(r: any) => (r.walletAddress ? `${r.walletAddress.slice(0, 6)}…${r.walletAddress.slice(-4)}` : "—")}
      />
      <DateField source="createdAt" label="Joined" showTime />
    </Datagrid>
  </List>
);

/* --------------------------- Transaction list --------------------------- */
function ApproveReject() {
  const record = useRecordContext<any>();
  const notify = useNotify();
  const refresh = useRefresh();
  if (!record || record.status !== "pending") return <span>—</span>;

  const act = async (action: "approve" | "reject") => {
    const res = await fetch(`/api/admin/transactions/${record.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      notify(`Transaction ${action}d`, { type: "success" });
      refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      notify(d.error ?? "Action failed", { type: "error" });
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button label="Approve" onClick={() => act("approve")} />
      <Button label="Reject" onClick={() => act("reject")} />
    </div>
  );
}

const TransactionActions = () => (
  <TopToolbar>
    <Title title="Transactions" />
  </TopToolbar>
);

export const TransactionList = () => (
  <List resource="transactions" exporter={false} perPage={25} actions={<TransactionActions />}>
    <Datagrid rowClick={false}>
      <FunctionField label="User" render={(r: any) => r.user?.name ?? "Unknown"} />
      <TextField source="type" />
      <FunctionField
        label="Amount"
        render={(r: any) => `${r.type === "withdrawal" ? "-" : "+"}${r.amount} ${r.asset}`}
      />
      <TextField source="address" label="Address" />
      <DateField source="createdAt" showTime />
      <TextField source="status" />
      <ApproveReject />
    </Datagrid>
  </List>
);

/* ------------------------------- App root ------------------------------- */
export default function AdminApp() {
  return (
    <Admin
      dataProvider={adminDataProvider}
      authProvider={authProvider}
      dashboard={AdminDashboard}
      title="Apex Admin"
    >
      <Resource name="users" list={UserList} />
      <Resource name="transactions" list={TransactionList} />
    </Admin>
  );
}
