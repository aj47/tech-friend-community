import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Development-only helpers for seeding data quickly.
 * NOTE: Do NOT call these in production. They bypass auth checks intentionally
 * to enable local/manual E2E verification without GitHub OAuth.
 */

/**
 * Insert a test user for development purposes
 */
export const insertTestUser = internalMutation({
  args: {
    githubId: v.string(),
    githubUsername: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    totalPoints: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      githubId: args.githubId,
      githubUsername: args.githubUsername,
      name: args.name,
      image: args.image,
      totalPoints: args.totalPoints ?? 0,
      tier: "builder",
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Update user points for development purposes
 */
export const updateUserPoints = internalMutation({
  args: {
    userId: v.id("users"),
    totalPoints: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      totalPoints: args.totalPoints,
    });

    return args.userId;
  },
});
