import type { ChainConfig } from "@/lib/integrations/chains";
import { SUPPORTED_CHAINS, getChain } from "@/lib/integrations/chains";

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

export interface InjectedWallet {
  uuid: string;
  name: string;
  icon: string;
  provider: Eip1193Provider;
}

export interface ConnectedWallet {
  address: string;
  chainId: number;
  provider: Eip1193Provider;
  label: string;
}

function getInjected(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum ?? null;
}

export function discoverInjectedWallets(): InjectedWallet[] {
  const injected = getInjected();
  if (!injected) return [];
  const wallets: InjectedWallet[] = [];
  const push = (name: string, provider: Eip1193Provider, icon: string) => {
    if (!wallets.some((w) => w.provider === provider)) {
      wallets.push({ uuid: name, name, icon, provider });
    }
  };
  if (injected.isMetaMask) push("MetaMask", injected, "🦊");
  if (injected.isCoinbaseWallet) push("Coinbase Wallet", injected, "🔵");
  push("Browser wallet", injected, "🌐");
  return wallets;
}

export function listenEip6963(
  onAnnounce: (wallets: InjectedWallet[]) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const found = new Map<string, InjectedWallet>();
  const handler = (event: Event) => {
    const detail = (event as CustomEvent).detail as {
      info: { uuid: string; name: string; icon: string };
      provider: Eip1193Provider;
    };
    const wallet: InjectedWallet = {
      uuid: detail.info.uuid,
      name: detail.info.name,
      icon: detail.info.icon,
      provider: detail.info.provider,
    };
    found.set(wallet.uuid, wallet);
    onAnnounce(Array.from(found.values()));
  };
  window.addEventListener("eip6963:announceProvider", handler as EventListener);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  return () => window.removeEventListener("eip6963:announceProvider", handler as EventListener);
}

export async function connectInjected(provider: Eip1193Provider, label: string): Promise<ConnectedWallet> {
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  const chainIdHex = (await provider.request({ method: "eth_chainId" })) as string;
  const chainId = parseInt(chainIdHex, 16);
  if (!accounts || accounts.length === 0) throw new Error("No accounts returned");
  return { address: accounts[0], chainId, provider, label };
}

export async function switchChain(connected: ConnectedWallet, chain: ChainConfig): Promise<void> {
  try {
    await connected.provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + chain.id.toString(16) }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await connected.provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x" + chain.id.toString(16),
            chainName: chain.name,
            nativeCurrency: { name: chain.nativeCurrency, symbol: chain.nativeCurrency, decimals: 18 },
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.explorerUrl],
          },
        ],
      });
      return;
    }
    throw err;
  }
}

export async function personalSign(connected: ConnectedWallet, message: string): Promise<string> {
  const accounts = (await connected.provider.request({ method: "eth_accounts" })) as string[];
  const address = accounts[0] ?? connected.address;
  return (await connected.provider.request({
    method: "personal_sign",
    params: [message, address],
  })) as string;
}

export interface EthereumProviderInstance {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, listener: (...args: unknown[]) => void): void;
  disconnect(): Promise<void>;
}

export interface WalletConnectConnector {
  connect(chainIds: number[]): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
}

export function createWalletConnectConnector(projectId: string): WalletConnectConnector {
  let provider: EthereumProviderInstance | null = null;
  return {
    async connect(chainIds) {
      const mod = (await import("@walletconnect/ethereum-provider")) as unknown as {
        EthereumProvider: new (c: {
          projectId: string;
          chains: number[];
          optionalChains?: number[];
        }) => Promise<EthereumProviderInstance>;
      };
      const instance = await new mod.EthereumProvider({
        projectId,
        chains: chainIds,
        optionalChains: SUPPORTED_CHAINS.map((c) => c.id),
      });
      provider = instance;
      await instance.request({ method: "eth_requestAccounts" });
      const accounts = (await instance.request({ method: "eth_accounts" })) as string[];
      const chainIdHex = (await instance.request({ method: "eth_chainId" })) as string;
      return {
        address: accounts[0],
        chainId: parseInt(chainIdHex, 16),
        provider: instance as unknown as Eip1193Provider,
        label: "WalletConnect",
      };
    },
    async disconnect() {
      await provider?.disconnect();
      provider = null;
    },
  };
}

export function isSupportedChain(chainId: number): boolean {
  return getChain(chainId) !== undefined;
}
