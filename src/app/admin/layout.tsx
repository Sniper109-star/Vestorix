import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return <>{children}</>;
}
