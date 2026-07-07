import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { WalletConnectButton } from "@/components/wallet-connect";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-sm text-white/50">Welcome back,</p>
            <p className="font-semibold">{user.name}</p>
          </div>
          <div className="flex items-center gap-6">
            <WalletConnectButton />
            <div className="text-right">
              <p className="text-xs text-white/40">Balance</p>
              <p className="font-semibold text-emerald-300">
                ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
