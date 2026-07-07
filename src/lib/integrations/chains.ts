export interface ChainConfig {
  id: number;
  key: string;
  name: string;
  shortName: string;
  nativeCurrency: string;
  rpcUrl: string;
  explorerUrl: string;
  testnet: boolean;
  color: string;
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 1,
    key: "ethereum",
    name: "Ethereum",
    shortName: "ETH",
    nativeCurrency: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    testnet: false,
    color: "#627eea",
  },
  {
    id: 8453,
    key: "base",
    name: "Base",
    shortName: "BASE",
    nativeCurrency: "ETH",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    testnet: false,
    color: "#0052ff",
  },
  {
    id: 137,
    key: "polygon",
    name: "Polygon",
    shortName: "POL",
    nativeCurrency: "POL",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    testnet: false,
    color: "#8247e5",
  },
  {
    id: 42161,
    key: "arbitrum",
    name: "Arbitrum One",
    shortName: "ARB",
    nativeCurrency: "ETH",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    testnet: false,
    color: "#28a0f0",
  },
  {
    id: 11155111,
    key: "sepolia",
    name: "Sepolia",
    shortName: "SEP",
    nativeCurrency: "ETH",
    rpcUrl: "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
    testnet: true,
    color: "#cfb53b",
  },
];

export function getChain(id: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((c) => c.id === id);
}

export function getChainByKey(key: string): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((c) => c.key === key);
}

export interface ChainlinkFeed {
  asset: string;
  address: string;
  decimals: number;
}

export const CHAINLINK_FEEDS: Record<number, ChainlinkFeed[]> = {
  1: [
    { asset: "ETH / USD", address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", decimals: 8 },
    { asset: "BTC / USD", address: "0xF403808a62CAe6b9E426b2dFeC4D6645c8D4d7A9", decimals: 8 },
    { asset: "USDC / USD", address: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6", decimals: 8 },
  ],
  8453: [
    { asset: "ETH / USD", address: "0x71041dddad3595F9CEd3E1AAd8E71a8ED7390Ee6", decimals: 8 },
    { asset: "USDC / USD", address: "0x7e8600980e5e1f89c5f0d1a3f19e3f4e1a0f0e0a", decimals: 8 },
  ],
  137: [
    { asset: "ETH / USD", address: "0xF9680D99D6C9589e2a93a78A04A279e509205945", decimals: 8 },
    { asset: "BTC / USD", address: "0xc907E116054Ad103354f2D1686327c7eDA39c055", decimals: 8 },
  ],
  42161: [
    { asset: "ETH / USD", address: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", decimals: 8 },
    { asset: "BTC / USD", address: "0x6cAEdC6bF430ceA8c192458A6311b8d1d4796af2", decimals: 8 },
  ],
  11155111: [
    { asset: "ETH / USD", address: "0x694AA1769357215DE4FAC081bf1f309aDC325306", decimals: 8 },
    { asset: "BTC / USD", address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", decimals: 8 },
  ],
};

export const AGGREGATOR_V3_ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
