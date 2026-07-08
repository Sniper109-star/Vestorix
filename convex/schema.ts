import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    walletAddress: v.union(v.string(), v.null()),
    balance: v.number(),
    createdAt: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_wallet", ["walletAddress"]),

  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  transactions: defineTable({
    userId: v.id("users"),
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
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  plans: defineTable({
    key: v.string(),
    name: v.string(),
    tagline: v.string(),
    min: v.number(),
    max: v.union(v.number(), v.null()),
    roi: v.union(v.number(), v.null()),
    assets: v.optional(v.array(v.string())),
    highlight: v.optional(v.boolean()),
  }).index("by_key", ["key"]),
});
