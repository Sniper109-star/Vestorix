import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return (await ctx.db.get(id as Id<"users">)) ?? null;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return (
      (await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique()) ?? null
    );
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const txs = await ctx.db.query("transactions").collect();
    return users.map((u) => ({
      ...u,
      txCount: txs.filter((t) => t.userId === u._id).length,
    }));
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    walletAddress: v.union(v.string(), v.null()),
    balance: v.number(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const update = mutation({
  args: { id: v.string(), patch: v.any() },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id as Id<"users">, patch);
    return (await ctx.db.get(id as Id<"users">)) ?? null;
  },
});
