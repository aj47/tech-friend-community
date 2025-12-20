"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AchievementBadge } from "./AchievementBadge";

interface AchievementsListProps {
  showAll?: boolean;
}

export function AchievementsList({ showAll = true }: AchievementsListProps) {
  const achievements = useQuery(api.achievements.getAchievementDefinitions);
  const myAchievements = useQuery(api.achievements.getMyAchievements);

  if (!achievements) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-[#111111] border border-[#222222] rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-start space-x-3">
              <div className="w-14 h-14 rounded-full bg-[#222222]" />
              <div className="flex-1">
                <div className="h-4 bg-[#222222] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[#222222] rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Create a map of unlocked achievements
  const unlockedMap = new Map<string, number>(
    myAchievements?.map((ua) => [ua.achievementId, ua.unlockedAt] as [string, number]) || []
  );

  // Calculate stats
  const unlockedCount = myAchievements?.length || 0;
  const totalCount = achievements.length;
  const totalPoints = myAchievements?.reduce(
    (sum, ua) => sum + (ua.achievement?.points || 0),
    0
  ) || 0;

  // Filter achievements if not showing all
  const displayAchievements = showAll
    ? achievements
    : achievements.filter((a) => unlockedMap.has(a.id));

  return (
    <div>
      {/* Stats Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">
            <span className="text-[#00FF41] font-bold">{unlockedCount}</span> /{" "}
            {totalCount} unlocked
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400 text-sm">
            <span className="text-[#00FF41] font-bold">{totalPoints}</span>{" "}
            achievement points
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-[#00FF41] transition-all duration-300"
          style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAchievements.map((achievement) => {
          const unlocked = unlockedMap.has(achievement.id);
          const unlockedAt = unlockedMap.get(achievement.id);

          return (
            <AchievementBadge
              key={achievement.id}
              id={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon}
              points={achievement.points}
              unlocked={unlocked}
              unlockedAt={unlockedAt}
            />
          );
        })}
      </div>

      {!showAll && unlockedCount === 0 && (
        <div className="text-center py-8 bg-[#111111] border border-[#222222] rounded-lg">
          <p className="text-gray-500">No achievements unlocked yet</p>
          <p className="text-gray-600 text-sm mt-2">
            Start contributing to earn your first achievement!
          </p>
        </div>
      )}
    </div>
  );
}

