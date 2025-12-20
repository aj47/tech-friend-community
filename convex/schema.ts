import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Define the schema for the Builder Community Platform
const schema = defineSchema({
  // Include auth tables from Convex Auth
  ...authTables,

  // Users table - extends auth with additional profile info
  users: defineTable({
    // Fields from authTables (required by Convex Auth)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // GitHub OAuth fields
    githubId: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    login: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    githubAccessToken: v.optional(v.string()),
    // Builder Community fields
    totalPoints: v.optional(v.number()),
    discordId: v.optional(v.string()),
    tier: v.optional(
      v.union(
        v.literal("builder"),
        v.literal("contributor"),
        v.literal("core"),
        v.literal("architect")
      )
    ),
    createdAt: v.optional(v.number()),
    // Legacy fields from old bounty platform (kept for backward compatibility)
    totalEarnings: v.optional(v.number()),
    totalBountiesPosted: v.optional(v.number()),
    totalPRsSubmitted: v.optional(v.number()),
  })
    .index("by_github_id", ["githubId"])
    .index("by_github_username", ["githubUsername"])
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_total_points", ["totalPoints"]),

  // Projects table - GitHub repos submitted by users
  projects: defineTable({
    ownerId: v.id("users"),
    githubRepoUrl: v.string(),
    githubRepoOwner: v.string(),
    githubRepoName: v.string(),
    title: v.string(),
    description: v.string(),
    helpWanted: v.string(),
    tags: v.array(v.string()),
    githubIssues: v.optional(v.array(v.object({
      number: v.number(),
      title: v.string(),
      url: v.string(),
      state: v.string(),
      labels: v.array(v.string()),
    }))),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Contributions table - tracks community contributions
  contributions: defineTable({
    contributorId: v.id("users"),
    projectId: v.id("projects"),
    type: v.union(
      v.literal("pr_merged"),
      v.literal("feedback_accepted"),
      v.literal("issue_merged")
    ),
    githubUrl: v.string(),
    pointsAwarded: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_contributor", ["contributorId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Rewards table - available rewards for redemption
  rewards: defineTable({
    name: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    type: v.union(
      v.literal("discord_role"),
      v.literal("shoutout"),
      v.literal("stream_feature")
    ),
    available: v.boolean(),
  })
    .index("by_type", ["type"])
    .index("by_available", ["available"])
    .index("by_points_cost", ["pointsCost"]),

  // Redemptions table - tracks reward redemptions
  redemptions: defineTable({
    userId: v.id("users"),
    rewardId: v.id("rewards"),
    status: v.union(v.literal("pending"), v.literal("fulfilled")),
    redeemedAt: v.number(),
    fulfilledAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_reward", ["rewardId"])
    .index("by_status", ["status"]),

  // Notifications table (kept and updated for new platform)
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("contribution_submitted"),
      v.literal("contribution_verified"),
      v.literal("contribution_rejected"),
      v.literal("reward_redeemed"),
      v.literal("reward_fulfilled"),
      v.literal("new_project"),
      v.literal("comment") // Legacy type from old data
    ),
    title: v.string(),
    message: v.string(),
    relatedProjectId: v.optional(v.id("projects")),
    relatedContributionId: v.optional(v.id("contributions")),
    relatedIssueId: v.optional(v.string()), // Legacy field from old data
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});

export default schema;
