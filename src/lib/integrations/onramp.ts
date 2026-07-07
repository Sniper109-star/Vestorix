export type OnrampProvider = "coinbase" | "stripe";

export interface OnrampRequest {
  provider: OnrampProvider;
  walletAddress: string;
  asset?: string;
  fiatCurrency?: string;
  amount?: string;
  redirectUrl?: string;
}

export interface OnrampResult {
  provider: OnrampProvider;
  url: string;
  sessionId?: string;
}

export interface OnrampConfig {
  coinbaseProjectId?: string;
  coinbaseApiKey?: string;
  stripeSecretKey?: string;
  stripeOnrampApiBase?: string;
}

export function getOnrampConfig(): OnrampConfig {
  return {
    coinbaseProjectId: process.env.COINBASE_ONRAMP_PROJECT_ID,
    coinbaseApiKey: process.env.COINBASE_ONRAMP_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeOnrampApiBase: process.env.STRIPE_ONRAMP_API_BASE ?? "https://api.stripe.com",
  };
}

export function createCoinbaseOnrampUrl(req: OnrampRequest, config: OnrampConfig): string {
  const base = "https://pay.coinbase.com/buy/select-asset";
  const params = new URLSearchParams();
  params.set("partnerUserId", req.walletAddress);
  params.set("destinationWallets", JSON.stringify([
    { address: req.walletAddress, blockchains: ["base", "ethereum", "polygon", "arbitrum"] },
  ]));
  if (req.asset) params.set("defaultAsset", req.asset);
  if (req.fiatCurrency) params.set("fiatCurrency", req.fiatCurrency);
  if (req.amount) params.set("fiatAmount", req.amount);
  if (config.coinbaseProjectId) params.set("appId", config.coinbaseProjectId);
  if (req.redirectUrl) params.set("redirectUrl", req.redirectUrl);
  return `${base}?${params.toString()}`;
}

export async function createStripeOnrampSession(
  req: OnrampRequest,
  config: OnrampConfig,
): Promise<string> {
  if (!config.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  const body = new URLSearchParams();
  body.set("wallet_address", req.walletAddress);
  if (req.asset) body.set("lock_asset", req.asset);
  if (req.fiatCurrency) body.set("lock_currency_code", req.fiatCurrency);
  if (req.amount) body.set("lock_fiat_amount", req.amount);
  if (req.redirectUrl) body.set("customer_ip_address", req.redirectUrl);

  const res = await fetch(`${config.stripeOnrampApiBase}/v1/crypto/onramp_sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Stripe onramp session failed: ${res.status}`);
  }
  const data = (await res.json()) as { client_secret?: string; id?: string; redirect_url?: string };
  return data.redirect_url ?? `https://paywithstyue.com/${data.id}`;
}

export async function createOnrampSession(req: OnrampRequest): Promise<OnrampResult> {
  const config = getOnrampConfig();
  if (req.provider === "coinbase") {
    return { provider: "coinbase", url: createCoinbaseOnrampUrl(req, config) };
  }
  const url = await createStripeOnrampSession(req, config);
  return { provider: "stripe", url };
}
