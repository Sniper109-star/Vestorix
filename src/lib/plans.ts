export interface InvestmentPlan {
  id: string;
  name: string;
  tagline: string;
  min: number;
  max: number | null;
  roi: number | null;
  assets?: string[];
  highlight?: boolean;
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: "startup",
    name: "Startup",
    tagline: "Entry-level plan for new investors getting started.",
    min: 65,
    max: 200,
    roi: 4.5,
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Balanced growth for more committed investors.",
    min: 300,
    max: 1000,
    roi: 6.6,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "High-yield plan with maximum returns.",
    min: 2000,
    max: 5000,
    roi: 10.5,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    tagline: "Unlimited crypto strategy across trending assets.",
    min: 1000,
    max: null,
    roi: null,
    assets: ["Meme", "Altcoin", "XRP", "BONK", "Solana"],
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
