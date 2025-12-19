import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Point values for different contribution types
const POINT_VALUES = {
  pr_merged: 50,
  feedback_accepted: 20,
  issue_merged: 30,
};

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
function calculateTier(points: number): "builder" | "contributor" | "core" | "architect" {
  if (points >= TIER_THRESHOLDS.architect) return "architect";
  if (points >= TIER_THRESHOLDS.core) return "core";
  if (points >= TIER_THRESHOLDS.contributor) return "contributor";
  return "builder";
}

/**
 * Submit a new contribution
 */
export const submitContribution = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("pr_merged"),
      v.literal("feedback_accepted"),
      v.literal("issue_merged")
    ),
    githubUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Cannot submit contribution to own project
    if (project.ownerId === userId) {
      throw new Error("Cannot submit contribution to your own project");
    }

    const pointsAwarded = POINT_VALUES[args.type];

    const contributionId = await ctx.db.insert("contributions", {
      contributorId: userId,
      projectId: args.projectId,
      type: args.type,
      githubUrl: args.githubUrl,
      pointsAwarded,
      status: "pending",
      createdAt: Date.now(),
    });

    // Notify project owner
    await ctx.db.insert("notifications", {
      userId: project.ownerId,
      type: "contribution_submitted",
      title: "New Contribution",
      message: `Someone submitted a contribution to your project "${project.title}"`,
      relatedProjectId: args.projectId,
      relatedContributionId: contributionId,
      isRead: false,
      createdAt: Date.now(),
    });

    return contributionId;
  },
});

/**
 * Verify a contribution (project owner only)
 */
export const verifyContribution = mutation({
  args: { contributionId: v.id("contributions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const contribution = await ctx.db.get(args.contributionId);
    if (!contribution) {
      throw new Error("Contribution not found");
    }

    const project = await ctx.db.get(contribution.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== userId) {
      throw new Error("Only the project owner can verify contributions");
    }

    if (contribution.status !== "pending") {
      throw new Error("Contribution has already been processed");
    }

    // Update contribution status
    await ctx.db.patch(args.contributionId, {
      status: "verified",
      verifiedAt: Date.now(),
    });

    // Update contributor's points
    const contributor = await ctx.db.get(contribution.contributorId);
    if (contributor) {
      const newPoints = (contributor.totalPoints || 0) + contribution.pointsAwarded;
      const newTier = calculateTier(newPoints);

      await ctx.db.patch(contribution.contributorId, {
        totalPoints: newPoints,
        tier: newTier,
      });
    }

    // Notify contributor
    await ctx.db.insert("notifications", {
      userId: contribution.contributorId,
      type: "contribution_verified",
      title: "Contribution Verified!",
      message: `Your contribution was verified! You earned ${contribution.pointsAwarded} points.`,
      relatedProjectId: contribution.projectId,
      relatedContributionId: args.contributionId,
      isRead: false,
      createdAt: Date.now(),
    });

    return args.contributionId;
  },
});

/**
 * Reject a contribution (project owner only)
 */
export const rejectContribution = mutation({
  args: { contributionId: v.id("contributions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const contribution = await ctx.db.get(args.contributionId);
    if (!contribution) {
      throw new Error("Contribution not found");
    }

    const project = await ctx.db.get(contribution.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== userId) {
      throw new Error("Only the project owner can reject contributions");
    }

    if (contribution.status !== "pending") {
      throw new Error("Contribution has already been processed");
    }

    await ctx.db.patch(args.contributionId, {
      status: "rejected",
    });

    // Notify contributor
    await ctx.db.insert("notifications", {
      userId: contribution.contributorId,
      type: "contribution_rejected",
      title: "Contribution Not Accepted",
      message: `Your contribution to "${project.title}" was not accepted.`,
      relatedProjectId: contribution.projectId,
      relatedContributionId: args.contributionId,
      isRead: false,
      createdAt: Date.now(),
    });

    return args.contributionId;
  },
});

/**
 * Get contributions for current user
 */
export const getMyContributions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", userId))
      .order("desc")
      .collect();

    const contributionsWithProjects = await Promise.all(
      contributions.map(async (contribution) => {
        const project = await ctx.db.get(contribution.projectId);
        return {
          ...contribution,
          project: project
            ? {
                _id: project._id,
                title: project.title,
                githubRepoOwner: project.githubRepoOwner,
                githubRepoName: project.githubRepoName,
              }
            : null,
        };
      })
    );

    return contributionsWithProjects;
  },
});

/**
 * Get contributions for a specific project
 */
export const getProjectContributions = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const contributionsWithUsers = await Promise.all(
      contributions.map(async (contribution) => {
        const contributor = await ctx.db.get(contribution.contributorId);
        return {
          ...contribution,
          contributor: contributor
            ? {
                _id: contributor._id,
                name: contributor.name,
                githubUsername: contributor.githubUsername,
                image: contributor.image,
              }
            : null,
        };
      })
    );

    return contributionsWithUsers;
  },
});

/**
 * Get leaderboard - top contributors by points
 */
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    period: v.optional(
      v.union(v.literal("week"), v.literal("month"), v.literal("all"))
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const period = args.period || "all";

    // Calculate time filter
    let timeFilter = 0;
    if (period === "week") {
      timeFilter = Date.now() - 7 * 24 * 60 * 60 * 1000;
    } else if (period === "month") {
      timeFilter = Date.now() - 30 * 24 * 60 * 60 * 1000;
    }

    if (period === "all") {
      // For all-time, just get users sorted by totalPoints
      const users = await ctx.db.query("users").collect();

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
    } else {
      // For time-based periods, calculate from verified contributions
      const contributions = await ctx.db
        .query("contributions")
        .withIndex("by_status", (q) => q.eq("status", "verified"))
        .collect();

      const filteredContributions = contributions.filter(
        (c) => c.verifiedAt && c.verifiedAt >= timeFilter
      );

      // Aggregate points by user
      const userPoints: Record<string, number> = {};
      for (const contribution of filteredContributions) {
        const id = contribution.contributorId;
        userPoints[id] = (userPoints[id] || 0) + contribution.pointsAwarded;
      }

      // Get user info and sort
      const leaderboard = await Promise.all(
        Object.entries(userPoints)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(async ([id, points], index) => {
            const user = await ctx.db.get(id as any);
            // Type guard to ensure we have a user object with expected properties
            const isUser = user && "name" in user;
            return {
              rank: index + 1,
              _id: id,
              name: isUser ? user.name || null : null,
              githubUsername: isUser && "githubUsername" in user ? user.githubUsername || null : null,
              image: isUser && "image" in user ? user.image || null : null,
              totalPoints: points,
              tier: isUser && "tier" in user ? user.tier || "builder" : "builder",
            };
          })
      );

      return leaderboard;
    }
  },
});

/**
 * Get contribution statistics
 */
export const getContributionStats = query({
  args: {},
  handler: async (ctx) => {
    const contributions = await ctx.db.query("contributions").collect();
    const projects = await ctx.db.query("projects").collect();
    const users = await ctx.db.query("users").collect();

    const verifiedContributions = contributions.filter(
      (c) => c.status === "verified"
    );
    const totalPoints = verifiedContributions.reduce(
      (sum, c) => sum + c.pointsAwarded,
      0
    );

    return {
      totalContributions: contributions.length,
      verifiedContributions: verifiedContributions.length,
      pendingContributions: contributions.filter((c) => c.status === "pending")
        .length,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      totalBuilders: users.length,
      totalPointsAwarded: totalPoints,
    };
  },
});
