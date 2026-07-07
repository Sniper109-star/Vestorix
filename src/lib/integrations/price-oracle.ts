import Web3 from "web3";
import { CHAINLINK_FEEDS, AGGREGATOR_V3_ABI, getChain } from "@/lib/integrations/chains";

export interface PriceFeed {
  chainId: number;
  chainName: string;
  asset: string;
  price: number;
  currency: string;
  updatedAt: number;
  decimals: number;
}

const clients = new Map<number, Web3>();

function getClient(chainId: number): Web3 {
  let client = clients.get(chainId);
  if (!client) {
    const chain = getChain(chainId);
    if (!chain) throw new Error(`Unsupported chain ${chainId}`);
    client = new Web3(chain.rpcUrl);
    clients.set(chainId, client);
  }
  return client;
}

export async function getPriceFeed(chainId: number, feedAddress: string, decimals: number): Promise<{ price: number; updatedAt: number }> {
  const web3 = getClient(chainId);
  const contract = new web3.eth.Contract(AGGREGATOR_V3_ABI as never, feedAddress);
  const data = (await contract.methods.latestRoundData().call()) as unknown as {
    answer: string | bigint;
    updatedAt: string | bigint;
  };
  const price = Number(data.answer) / 10 ** decimals;
  const updatedAt = Number(data.updatedAt);
  return { price, updatedAt };
}

export async function getAllPriceFeeds(): Promise<PriceFeed[]> {
  const feeds: PriceFeed[] = [];
  for (const [chainId, list] of Object.entries(CHAINLINK_FEEDS)) {
    const id = Number(chainId);
    const chain = getChain(id);
    if (!chain) continue;
    for (const feed of list) {
      try {
        const { price, updatedAt } = await getPriceFeed(id, feed.address, feed.decimals);
        feeds.push({
          chainId: id,
          chainName: chain.name,
          asset: feed.asset,
          price,
          currency: "USD",
          updatedAt,
          decimals: feed.decimals,
        });
      } catch {
        feeds.push({
          chainId: id,
          chainName: chain.name,
          asset: feed.asset,
          price: 0,
          currency: "USD",
          updatedAt: 0,
          decimals: feed.decimals,
        });
      }
    }
  }
  return feeds;
}

export interface TokenPrice {
  symbol: string;
  priceUsd: number;
}

export async function getTokenPrices(symbols: string[]): Promise<TokenPrice[]> {
  const feeds = await getAllPriceFeeds();
  return symbols
    .map((symbol) => {
      const match = feeds.find((f) => f.asset.toLowerCase().startsWith(symbol.toLowerCase()));
      return match ? { symbol, priceUsd: match.price } : { symbol, priceUsd: 0 };
    })
    .filter((t) => t.priceUsd > 0);
}
