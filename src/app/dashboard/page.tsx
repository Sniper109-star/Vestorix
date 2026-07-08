import { getUserFromCookie } from "@/lib/auth";
import { DashboardHome } from "@/components/dashboard-home";

export default async function OverviewPage() {
  const user = await getUserFromCookie();
  if (!user) return null;
  return <DashboardHome user={user} />;
}
