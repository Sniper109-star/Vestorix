export interface InvestmentPlan {
  id: string;
  name: string;
  tagline: string;
  min: number;
  max: number | null;
  roi: number | null;
  icon: string;
  assets?: string[];
  highlight?: boolean;
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: "startup",
    name: "Startup",
    tagline: "Grow wealth and profits using crypto (Solana).",
    min: 65,
    max: 200,
    roi: 4.5,
    icon: "solana",
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Grow wealth and profits using Agriculture.",
    min: 300,
    max: 1000,
    roi: 6.6,
    icon: "plant",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Grow wealth and profits using Real Estate investment.",
    min: 2000,
    max: 5000,
    roi: 10.5,
    icon: "building",
  },
  {
    id: "unlimited",
    name: "Unlimited",
    tagline:
      "Grow wealth and profits using Car stock, Altcoin, BONK, XRP, Meme.",
    min: 1000,
    max: null,
    roi: null,
    icon: "trending",
    assets: ["Car stock", "Altcoin", "BONK", "XRP", "Meme"],
    highlight: true,
  },
];

export function formatRange(plan: InvestmentPlan): string {
  const max = plan.max === null ? "Unlimited" : `$${plan.max.toLocaleString()}`;
  return `$${plan.min.toLocaleString()} – ${max}`;
}

export function formatRoi(plan: InvestmentPlan): string {
  return plan.roi === null ? "Variable" : `${plan.roi}%`;
}
