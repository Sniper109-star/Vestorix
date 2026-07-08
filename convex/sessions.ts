import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    return (
      (await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", token))
        .unique()) ?? null
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    userId: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { token, userId, expiresAt }) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return await ctx.db.insert("sessions", {
      token,
      userId: userId as Id<"users">,
      expiresAt,
    });
  },
});

export const remove = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (s) await ctx.db.delete(s._id);
    return true;
  },
});
