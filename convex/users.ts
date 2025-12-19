import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { Octokit } from "octokit";
import type { Doc } from "./_generated/dataModel";

// Tier thresholds
const TIER_THRESHOLDS = {
  builder: 0,
  contributor: 100,
  core: 500,
  architect: 1000,
};

/**
 * Calculate user tier based on points
 */
function calculateTier(
  points: number
): "builder" | "contributor" | "core" | "architect" {
  if (points >= TIER_THRESHOLDS.architect) return "architect";
  if (points >= TIER_THRESHOLDS.core) return "core";
  if (points >= TIER_THRESHOLDS.contributor) return "contributor";
  return "builder";
}

/**
 * Get or create user profile
 */
export const getOrCreateUser = mutation({
  args: {
    githubId: v.string(),
    githubUsername: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    githubAccessToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .first();

    if (existingUser) {
      // Update user info
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        image: args.image,
        githubUsername: args.githubUsername,
        githubAccessToken: args.githubAccessToken,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      githubId: args.githubId,
      githubUsername: args.githubUsername,
      name: args.name,
      email: args.email,
      image: args.image,
      githubAccessToken: args.githubAccessToken,
      totalPoints: 0,
      tier: "builder",
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get current user profile
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Get user by ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by GitHub username
 */
export const getUserByGitHubUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_github_username", (q) =>
        q.eq("githubUsername", args.username)
      )
      .first();
  },
});

/**
 * Update user profile
 */
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    discordId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.discordId !== undefined) updates.discordId = args.discordId;

    await ctx.db.patch(userId, updates);

    return userId;
  },
});

/**
 * Get user statistics
 */
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Get projects submitted by user
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();

    // Get contributions made by user
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", args.userId))
      .collect();

    // Get redemptions by user
    const redemptions = await ctx.db
      .query("redemptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      user: {
        _id: user._id,
        name: user.name,
        githubUsername: user.githubUsername,
        image: user.image,
        totalPoints: user.totalPoints || 0,
        tier: user.tier || "builder",
        discordId: user.discordId,
      },
      stats: {
        projectsSubmitted: projects.length,
        activeProjects: projects.filter((p) => p.status === "active").length,
        contributionsMade: contributions.length,
        contributionsVerified: contributions.filter((c) => c.status === "verified").length,
        contributionsPending: contributions.filter((c) => c.status === "pending").length,
        pointsEarned: contributions
          .filter((c) => c.status === "verified")
          .reduce((sum, c) => sum + c.pointsAwarded, 0),
        rewardsRedeemed: redemptions.length,
        rewardsFulfilled: redemptions.filter((r) => r.status === "fulfilled").length,
      },
    };
  },
});

/**
 * Get leaderboard - top contributors by points
 */
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const users = await ctx.db.query("users").collect();

    // Sort by total points
    const sortedUsers = users
      .filter((u) => (u.totalPoints || 0) > 0)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, limit);

    return sortedUsers.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      githubUsername: user.githubUsername,
      image: user.image,
      totalPoints: user.totalPoints || 0,
      tier: user.tier || "builder",
    }));
  },
});

/**
 * Update user GitHub access token
 */
export const updateGitHubAccessToken = mutation({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const octokit = new Octokit({ auth: args.accessToken });
    const { data: profile } = await octokit.rest.users.getAuthenticated();

    const updates: Partial<Omit<Doc<"users">, "_id" | "_creationTime">> = {
      githubAccessToken: args.accessToken,
    };

    if (profile.id !== undefined && profile.id !== null) {
      updates.githubId = String(profile.id);
    } else if (existingUser.githubId) {
      updates.githubId = existingUser.githubId;
    }

    if (profile.login) {
      updates.githubUsername = profile.login;
    } else if (existingUser.githubUsername) {
      updates.githubUsername = existingUser.githubUsername;
    }

    if (profile.name) {
      updates.name = profile.name;
    } else if (!existingUser.name && profile.login) {
      updates.name = profile.login;
    }

    if (profile.avatar_url) {
      updates.image = profile.avatar_url;
    }

    if (profile.email) {
      updates.email = profile.email;
    }

    if (typeof existingUser.totalPoints !== "number") {
      updates.totalPoints = 0;
    }

    if (!existingUser.tier) {
      updates.tier = "builder";
    }

    if (!existingUser.createdAt) {
      updates.createdAt = Date.now();
    }

    await ctx.db.patch(userId, updates);

    return userId;
  },
});

/**
 * Get tier thresholds
 */
export const getTierThresholds = query({
  args: {},
  handler: async () => {
    return TIER_THRESHOLDS;
  },
});
