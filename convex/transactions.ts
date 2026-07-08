import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transactions").collect();
  },
});

export const listUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .collect();
  },
});

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", status as never))
      .collect();
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return (await ctx.db.get(id as Id<"transactions">)) ?? null;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("deposit"), v.literal("withdrawal")),
    amount: v.number(),
    asset: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    txHash: v.union(v.string(), v.null()),
    address: v.union(v.string(), v.null()),
    note: v.union(v.string(), v.null()),
    createdAt: v.string(),
    processedAt: v.union(v.string(), v.null()),
    processedBy: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", {
      userId: args.userId as Id<"users">,
      type: args.type,
      amount: args.amount,
      asset: args.asset,
      status: args.status,
      txHash: args.txHash,
      address: args.address,
      note: args.note,
      createdAt: args.createdAt,
      processedAt: args.processedAt,
      processedBy: args.processedBy,
    });
  },
});

export const update = mutation({
  args: { id: v.string(), patch: v.any() },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id as Id<"transactions">, patch);
    return (await ctx.db.get(id as Id<"transactions">)) ?? null;
  },
});
