import Web3 from "web3";

const RPC_URL =
  process.env.WEB3_RPC_URL ?? "https://eth.llamarpc.com";

let cached: Web3 | null = null;

function getWeb3(): Web3 {
  if (!cached) {
    cached = new Web3(RPC_URL);
  }
  return cached;
}

export interface BalanceResult {
  address: string;
  eth: string;
  wei: string;
}

export async function getNativeBalance(address: string): Promise<BalanceResult> {
  const web3 = getWeb3();
  if (!web3.utils.isAddress(address)) {
    throw new Error("Invalid wallet address");
  }
  const wei = await web3.eth.getBalance(address);
  return {
    address,
    wei: wei.toString(),
    eth: web3.utils.fromWei(wei, "ether"),
  };
}

export interface TxMeta {
  hash: string;
  from: string | null;
  to: string | null;
  valueEth: string;
  blockNumber: number | null;
  confirmed: boolean;
}

export async function getTransaction(txHash: string): Promise<TxMeta | null> {
  const web3 = getWeb3();
  if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
    throw new Error("Invalid transaction hash");
  }
  const tx = await web3.eth.getTransaction(txHash);
  if (!tx) return null;
  const receipt = await web3.eth.getTransactionReceipt(txHash);
  return {
    hash: tx.hash,
    from: tx.from ?? null,
    to: tx.to ?? null,
    valueEth: web3.utils.fromWei(web3.utils.toBigInt(tx.value ?? 0), "ether"),
    blockNumber: tx.blockNumber ? Number(tx.blockNumber) : null,
    confirmed: receipt != null,
  };
}
