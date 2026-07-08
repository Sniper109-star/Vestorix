import { redirect } from "next/navigation";
import { getUserFromCookie, assertAdmin } from "@/lib/auth";
import { AdminLoader } from "@/components/admin/AdminLoader";

export default async function AdminPage() {
  const user = await getUserFromCookie();
  if (!user) redirect("/login");
  try {
    assertAdmin(user);
  } catch {
    redirect("/dashboard");
  }
  return <AdminLoader />;
}
