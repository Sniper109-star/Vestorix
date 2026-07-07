import { getUserFromCookie } from "@/lib/auth";
import { db } from "@/lib/store";
import { ProfileForm } from "@/components/profile-form";
import { Card } from "@/components/ui";
import { formatDate, shortAddress } from "@/lib/format";

export default async function ProfilePage() {
  const user = await getUserFromCookie();
  if (!user) return null;
  const full = await db.getUserById(user.id);
  if (!full) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <ProfileForm user={user} />

      <Card>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/50">
          Account details
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/50">Role</dt>
            <dd className="capitalize">{user.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/50">Member since</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/50">Wallet</dt>
            <dd className="font-mono">{shortAddress(user.walletAddress)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
