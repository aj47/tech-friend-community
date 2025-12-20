"use client";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: {
    container: "px-2 py-1",
    icon: "text-sm",
    text: "text-xs",
  },
  md: {
    container: "px-3 py-1.5",
    icon: "text-base",
    text: "text-sm",
  },
  lg: {
    container: "px-4 py-2",
    icon: "text-lg",
    text: "text-base",
  },
};

/**
 * Get streak color based on streak length
 * - Gray: < 3 days
 * - Yellow: 3-6 days
 * - Orange: 7-13 days
 * - Red: >= 14 days
 */
function getStreakColor(streak: number): {
  color: string;
  bgColor: string;
  borderColor: string;
} {
  if (streak >= 14) {
    return {
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30",
    };
  }
  if (streak >= 7) {
    return {
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
    };
  }
  if (streak >= 3) {
    return {
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
    };
  }
  return {
    color: "text-gray-400",
    bgColor: "bg-gray-400/20",
    borderColor: "border-gray-400/30",
  };
}

export function StreakBadge({
  currentStreak,
  longestStreak,
  size = "md",
}: StreakBadgeProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const streakColors = getStreakColor(currentStreak);

  // Don't show badge if no streak
  if (currentStreak === 0) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center space-x-1 ${sizeConfig.container} rounded-full ${streakColors.bgColor} border ${streakColors.borderColor} cursor-default group relative`}
      title={`${currentStreak} day streak! Best: ${longestStreak} days`}
    >
      <span className={sizeConfig.icon}>🔥</span>
      <span className={`${sizeConfig.text} ${streakColors.color} font-bold`}>
        {currentStreak}
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <div className="text-sm text-white font-medium">
          {currentStreak} day streak!
        </div>
        <div className="text-xs text-gray-400">Best: {longestStreak} days</div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#333]" />
      </div>
    </div>
  );
}

