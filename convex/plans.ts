import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("plans").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("plans").collect();
    if (existing.length > 0) return existing.length;

    const plans = [
      {
        key: "startup",
        name: "Startup",
        tagline: "Grow wealth and profits using crypto (Solana).",
        min: 65,
        max: 200,
        roi: 4.5,
        assets: undefined,
        highlight: false,
      },
      {
        key: "professional",
        name: "Professional",
        tagline: "Grow wealth and profits using Agriculture.",
        min: 300,
        max: 1000,
        roi: 6.6,
        assets: undefined,
        highlight: false,
      },
      {
        key: "premium",
        name: "Premium",
        tagline: "Grow wealth and profits using Real Estate investment.",
        min: 2000,
        max: 5000,
        roi: 10.5,
        assets: undefined,
        highlight: false,
      },
      {
        key: "unlimited",
        name: "Unlimited",
        tagline:
          "Grow wealth and profits using Car stock, Altcoin, BONK, XRP, Meme.",
        min: 1000,
        max: null,
        roi: null,
        assets: ["Car stock", "Altcoin", "BONK", "XRP", "Meme"],
        highlight: true,
      },
    ];

    for (const p of plans) {
      await ctx.db.insert("plans", p);
    }
    return plans.length;
  },
});
