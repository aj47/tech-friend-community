import { query, MutationCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format (UTC)
 */
function getYesterdayDateString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().split("T")[0];
}

/**
 * Update a user's streak when they make a contribution.
 * This is a helper function to be called from mutations.
 *
 * Streak logic:
 * - If last contribution was yesterday, increment streak by 1
 * - If last contribution was today, keep streak the same
 * - If last contribution was more than 1 day ago (or never), reset to 1
 * - Update longestStreak if currentStreak exceeds it
 */
export async function updateStreak(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) {
    return;
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const lastContributionDate = user.lastContributionDate;

  let newStreak: number;

  if (lastContributionDate === today) {
    // Already contributed today, keep streak the same
    newStreak = user.currentStreak || 1;
  } else if (lastContributionDate === yesterday) {
    // Contributed yesterday, increment streak
    newStreak = (user.currentStreak || 0) + 1;
  } else {
    // More than 1 day ago or never, reset to 1
    newStreak = 1;
  }

  // Update longestStreak if current exceeds it
  const longestStreak = Math.max(newStreak, user.longestStreak || 0);

  await ctx.db.patch(userId, {
    currentStreak: newStreak,
    longestStreak: longestStreak,
    lastContributionDate: today,
  });
}

/**
 * Get the current user's streak info
 */
export const getMyStreak = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return {
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastContributionDate: user.lastContributionDate || null,
    };
  },
});

/**
 * Get users with the longest current streaks
 */
export const getStreakLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // Filter users with streaks and sort by current streak
    const usersWithStreaks = users
      .filter((u) => (u.currentStreak || 0) > 0)
      .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
      .slice(0, 10);

    return usersWithStreaks.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      githubUsername: user.githubUsername,
      image: user.image,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
    }));
  },
});

