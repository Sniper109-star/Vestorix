"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/dashboard/deposit", label: "Deposit", icon: "↓" },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: "↑" },
  { href: "/dashboard/transactions", label: "Transactions", icon: "≣" },
  { href: "/dashboard/profile", label: "Profile", icon: "◉" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-white/10 bg-white/[0.02] p-4">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-emerald-950">
          ◆
        </span>
        Apex
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((l) => {
          const active =
            l.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-4 text-center">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="mt-4 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
      >
        Sign out
      </button>
    </aside>
  );
}
