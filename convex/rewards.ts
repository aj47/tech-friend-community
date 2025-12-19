import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get all available rewards
 */
export const getRewards = query({
  args: {},
  handler: async (ctx) => {
    const rewards = await ctx.db
      .query("rewards")
      .withIndex("by_available", (q) => q.eq("available", true))
      .collect();

    return rewards.sort((a, b) => a.pointsCost - b.pointsCost);
  },
});

/**
 * Redeem a reward
 */
export const redeemReward = mutation({
  args: { rewardId: v.id("rewards") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }

    if (!reward.available) {
      throw new Error("Reward is not available");
    }

    const userPoints = user.totalPoints || 0;
    if (userPoints < reward.pointsCost) {
      throw new Error(
        `Insufficient points. You have ${userPoints} but need ${reward.pointsCost}.`
      );
    }

    // Create redemption
    const redemptionId = await ctx.db.insert("redemptions", {
      userId,
      rewardId: args.rewardId,
      status: "pending",
      redeemedAt: Date.now(),
    });

    // Deduct points
    await ctx.db.patch(userId, {
      totalPoints: userPoints - reward.pointsCost,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      userId,
      type: "reward_redeemed",
      title: "Reward Redeemed!",
      message: `You redeemed "${reward.name}" for ${reward.pointsCost} points. We'll fulfill it soon!`,
      isRead: false,
      createdAt: Date.now(),
    });

    return redemptionId;
  },
});

/**
 * Get current user's redemptions
 */
export const getMyRedemptions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const redemptions = await ctx.db
      .query("redemptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const redemptionsWithRewards = await Promise.all(
      redemptions.map(async (redemption) => {
        const reward = await ctx.db.get(redemption.rewardId);
        return {
          ...redemption,
          reward: reward
            ? {
                _id: reward._id,
                name: reward.name,
                description: reward.description,
                type: reward.type,
                pointsCost: reward.pointsCost,
              }
            : null,
        };
      })
    );

    return redemptionsWithRewards;
  },
});

/**
 * Fulfill a redemption (admin only - for now, any authenticated user can do this)
 */
export const fulfillRedemption = mutation({
  args: { redemptionId: v.id("redemptions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption) {
      throw new Error("Redemption not found");
    }

    if (redemption.status === "fulfilled") {
      throw new Error("Redemption already fulfilled");
    }

    await ctx.db.patch(args.redemptionId, {
      status: "fulfilled",
      fulfilledAt: Date.now(),
    });

    const reward = await ctx.db.get(redemption.rewardId);

    // Notify user
    await ctx.db.insert("notifications", {
      userId: redemption.userId,
      type: "reward_fulfilled",
      title: "Reward Fulfilled!",
      message: `Your "${reward?.name || "reward"}" has been fulfilled!`,
      isRead: false,
      createdAt: Date.now(),
    });

    return args.redemptionId;
  },
});

/**
 * Seed initial rewards
 */
export const seedRewards = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if rewards already exist
    const existingRewards = await ctx.db.query("rewards").collect();
    if (existingRewards.length > 0) {
      throw new Error("Rewards already seeded");
    }

    const initialRewards = [
      {
        name: "Discord Builder Role",
        description: "Get the Builder role in our Discord server",
        pointsCost: 50,
        type: "discord_role" as const,
        available: true,
      },
      {
        name: "Discord Contributor Role",
        description: "Get the Contributor role in our Discord server",
        pointsCost: 100,
        type: "discord_role" as const,
        available: true,
      },
      {
        name: "Discord Core Role",
        description: "Get the Core role in our Discord server",
        pointsCost: 500,
        type: "discord_role" as const,
        available: true,
      },
      {
        name: "Shoutout (130k followers)",
        description: "Get a shoutout to our 130k followers on social media",
        pointsCost: 200,
        type: "shoutout" as const,
        available: true,
      },
      {
        name: "15-min Stream Feature",
        description: "Get your project featured for 15 minutes on our stream",
        pointsCost: 500,
        type: "stream_feature" as const,
        available: true,
      },
      {
        name: "Full Dedicated Stream",
        description: "Get a full dedicated stream for your project",
        pointsCost: 1000,
        type: "stream_feature" as const,
        available: true,
      },
    ];

    for (const reward of initialRewards) {
      await ctx.db.insert("rewards", reward);
    }

    return { seeded: initialRewards.length };
  },
});

/**
 * Create a new reward (admin function)
 */
export const createReward = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    type: v.union(
      v.literal("discord_role"),
      v.literal("shoutout"),
      v.literal("stream_feature")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const rewardId = await ctx.db.insert("rewards", {
      name: args.name,
      description: args.description,
      pointsCost: args.pointsCost,
      type: args.type,
      available: true,
    });

    return rewardId;
  },
});

/**
 * Toggle reward availability
 */
export const toggleRewardAvailability = mutation({
  args: { rewardId: v.id("rewards") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }

    await ctx.db.patch(args.rewardId, {
      available: !reward.available,
    });

    return args.rewardId;
  },
});
