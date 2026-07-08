"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  discoverInjectedWallets,
  connectInjected,
  type InjectedWallet,
} from "@/lib/integrations/wallet";
import { shortAddress } from "@/lib/format";

const CONVEX_ENABLED = !!process.env.NEXT_PUBLIC_CONVEX_URL;

export function WalletLink({
  userId,
  current,
}: {
  userId: string;
  current: string | null;
}) {
  if (!CONVEX_ENABLED) {
    return (
      <p className="text-sm text-white/50">
        Real-time wallet linking requires Convex. Set{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
          NEXT_PUBLIC_CONVEX_URL
        </code>{" "}
        to enable.
      </p>
    );
  }
  return <WalletLinkLive userId={userId} current={current} />;
}

function WalletLinkLive({
  userId,
  current,
}: {
  userId: string;
  current: string | null;
}) {
  const [wallets, setWallets] = useState<InjectedWallet[]>([]);
  const [address, setAddress] = useState(current ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = useMutation(api.users.update);

  useEffect(() => {
    setWallets(discoverInjectedWallets());
  }, []);

  async function connect(w: InjectedWallet) {
    setBusy(true);
    setError(null);
    try {
      const connected = await connectInjected(w.provider, w.name);
      await update({ id: userId, patch: { walletAddress: connected.address } });
      setAddress(connected.address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    await update({ id: userId, patch: { walletAddress: null } });
    setAddress("");
  }

  return (
    <div className="space-y-3">
      {address ? (
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
          <span className="font-mono text-sm text-emerald-300">
            {shortAddress(address)}
          </span>
          <button
            onClick={disconnect}
            className="text-xs text-white/50 hover:text-white"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <p className="text-sm text-white/50">
          Connect an EVM wallet to link it to your account.
        </p>
      )}

      {!address && (
        <div className="flex flex-wrap gap-2">
          {wallets.length === 0 && (
            <span className="text-xs text-white/40">No browser wallet detected</span>
          )}
          {wallets.map((w) => (
            <button
              key={w.uuid}
              disabled={busy}
              onClick={() => connect(w)}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-60"
            >
              <span>{w.icon}</span>
              {w.name}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
