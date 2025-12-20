import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Achievement definitions
export const ACHIEVEMENTS = {
  first_contribution: {
    name: "First Steps",
    description: "Submit your first contribution",
    icon: "rocket",
    points: 10,
  },
  five_contributions: {
    name: "Getting Started",
    description: "Submit 5 contributions",
    icon: "star",
    points: 25,
  },
  ten_contributions: {
    name: "Contributor",
    description: "Submit 10 contributions",
    icon: "trophy",
    points: 50,
  },
  first_project: {
    name: "Project Owner",
    description: "Submit your first project",
    icon: "folder",
    points: 20,
  },
  first_verified: {
    name: "Verified!",
    description: "Get your first contribution verified",
    icon: "check",
    points: 15,
  },
  week_streak: {
    name: "On Fire",
    description: "Maintain a 7-day streak",
    icon: "flame",
    points: 50,
  },
  helper: {
    name: "Community Helper",
    description: "Contribute to 3 different projects",
    icon: "heart",
    points: 30,
  },
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;

/**
 * Get all achievement definitions
 */
export const getAchievementDefinitions = query({
  args: {},
  handler: async () => {
    return Object.entries(ACHIEVEMENTS).map(([id, achievement]) => ({
      id,
      ...achievement,
    }));
  },
});

/**
 * Get current user's unlocked achievements
 */
export const getMyAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return userAchievements.map((ua) => ({
      ...ua,
      achievement: ACHIEVEMENTS[ua.achievementId as AchievementId],
    }));
  },
});

/**
 * Check and unlock achievements based on user's stats
 */
export const checkAndUnlockAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get user's existing achievements
    const existingAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const unlockedIds = new Set(existingAchievements.map((a) => a.achievementId));

    // Get user's contributions
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", userId))
      .collect();

    // Get user's projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const verifiedContributions = contributions.filter((c) => c.status === "verified");
    const uniqueProjects = new Set(contributions.map((c) => c.projectId));

    const newAchievements: AchievementId[] = [];

    // Check first_contribution
    if (contributions.length >= 1 && !unlockedIds.has("first_contribution")) {
      newAchievements.push("first_contribution");
    }

    // Check five_contributions
    if (contributions.length >= 5 && !unlockedIds.has("five_contributions")) {
      newAchievements.push("five_contributions");
    }

    // Check ten_contributions
    if (contributions.length >= 10 && !unlockedIds.has("ten_contributions")) {
      newAchievements.push("ten_contributions");
    }

    // Check first_project
    if (projects.length >= 1 && !unlockedIds.has("first_project")) {
      newAchievements.push("first_project");
    }

    // Check first_verified
    if (verifiedContributions.length >= 1 && !unlockedIds.has("first_verified")) {
      newAchievements.push("first_verified");
    }

    // Check helper (contributed to 3 different projects)
    if (uniqueProjects.size >= 3 && !unlockedIds.has("helper")) {
      newAchievements.push("helper");
    }

    // Check week_streak (7 consecutive days with contributions)
    if (!unlockedIds.has("week_streak")) {
      const hasWeekStreak = checkWeekStreak(contributions.map((c) => c.createdAt));
      if (hasWeekStreak) {
        newAchievements.push("week_streak");
      }
    }

    // Unlock new achievements
    for (const achievementId of newAchievements) {
      await ctx.db.insert("userAchievements", {
        userId,
        achievementId,
        unlockedAt: Date.now(),
      });
    }

    return newAchievements;
  },
});

/**
 * Helper function to check if user has a 7-day streak
 */
function checkWeekStreak(timestamps: number[]): boolean {
  if (timestamps.length < 7) return false;

  // Group contributions by day
  const days = new Set<string>();
  for (const ts of timestamps) {
    const date = new Date(ts);
    days.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  }

  // Check for 7 consecutive days
  const sortedDays = Array.from(days).sort();
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
      if (streak >= 7) return true;
    } else {
      streak = 1;
    }
  }
  return streak >= 7;
}

