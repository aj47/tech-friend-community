import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { auth } from "./auth";

/**
 * Log an activity event (internal mutation for use by other mutations)
 */
export const logActivity = internalMutation({
  args: {
    type: v.union(
      v.literal("contribution_submitted"),
      v.literal("contribution_verified"),
      v.literal("project_created"),
      v.literal("reward_redeemed"),
      v.literal("tier_upgraded"),
      v.literal("streak_milestone")
    ),
    userId: v.id("users"),
    relatedId: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activityFeed", {
      type: args.type,
      userId: args.userId,
      relatedId: args.relatedId,
      message: args.message,
      createdAt: Date.now(),
    });
    return activityId;
  },
});

/**
 * Get recent activity for the public feed
 * Returns the latest 20 activity items with user info
 */
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);

    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                githubUsername: user.githubUsername,
                image: user.image,
                tier: user.tier || "builder",
              }
            : null,
        };
      })
    );

    return activitiesWithUsers;
  },
});

/**
 * Get activity for the current user
 */
export const getMyActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 20;

    const activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return activities;
  },
});

