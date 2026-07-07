"use client";

import { useEffect, useState } from "react";
import {
  discoverInjectedWallets,
  listenEip6963,
  connectInjected,
  switchChain,
  type ConnectedWallet,
  type InjectedWallet,
} from "@/lib/integrations/wallet";
import { SUPPORTED_CHAINS, getChain } from "@/lib/integrations/chains";
import { shortAddress } from "@/lib/format";

export function WalletConnectButton() {
  const [wallets, setWallets] = useState<InjectedWallet[]>([]);
  const [connected, setConnected] = useState<ConnectedWallet | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWallets(discoverInjectedWallets());
    const stop = listenEip6963(setWallets);
    return stop;
  }, []);

  async function connect(wallet: InjectedWallet) {
    setBusy(true);
    setError(null);
    try {
      const c = await connectInjected(wallet.provider, wallet.name);
      setConnected(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setBusy(false);
    }
  }

  async function changeChain(chainId: number) {
    if (!connected) return;
    const chain = getChain(chainId);
    if (!chain) return;
    setBusy(true);
    setError(null);
    try {
      await switchChain(connected, chain);
      setConnected({ ...connected, chainId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Switch failed");
    } finally {
      setBusy(false);
    }
  }

  if (connected) {
    const chain = getChain(connected.chainId);
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-mono text-white/70">
          {shortAddress(connected.address)}
        </span>
        <select
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/80 outline-none"
          value={connected.chainId}
          onChange={(e) => changeChain(Number(e.target.value))}
        >
          {SUPPORTED_CHAINS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setConnected(null)}
          className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-white/60 hover:bg-white/5"
        >
          Disconnect
        </button>
        {!chain && <span className="text-xs text-amber-300">Unsupported chain</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
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
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
