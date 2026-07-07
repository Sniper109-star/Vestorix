"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("@/components/admin/AdminApp"), {
  ssr: false,
  loading: () => <p style={{ padding: 24 }}>Loading admin console…</p>,
});

export function AdminLoader() {
  return <AdminApp />;
}
