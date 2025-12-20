"use client";

import {
  Rocket,
  Star,
  Trophy,
  Folder,
  Check,
  Flame,
  Heart,
  LucideIcon,
} from "lucide-react";

// Icon mapping for achievement types
const ICON_MAP: Record<string, LucideIcon> = {
  rocket: Rocket,
  star: Star,
  trophy: Trophy,
  folder: Folder,
  check: Check,
  flame: Flame,
  heart: Heart,
};

interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: {
    container: "p-3",
    icon: "w-6 h-6",
    iconContainer: "w-10 h-10",
    title: "text-sm",
    description: "text-xs",
    points: "text-xs",
  },
  md: {
    container: "p-4",
    icon: "w-8 h-8",
    iconContainer: "w-14 h-14",
    title: "text-base",
    description: "text-sm",
    points: "text-sm",
  },
  lg: {
    container: "p-6",
    icon: "w-10 h-10",
    iconContainer: "w-18 h-18",
    title: "text-lg",
    description: "text-base",
    points: "text-base",
  },
};

export function AchievementBadge({
  name,
  description,
  icon,
  points,
  unlocked,
  unlockedAt,
  size = "md",
}: AchievementBadgeProps) {
  const Icon = ICON_MAP[icon] || Star;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={`
        ${sizeConfig.container}
        bg-[#111111] border rounded-lg
        transition-all duration-200
        ${
          unlocked
            ? "border-[#00FF41]/50 hover:border-[#00FF41]"
            : "border-[#222222] opacity-50 grayscale"
        }
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div
          className={`
            ${sizeConfig.iconContainer}
            rounded-full flex items-center justify-center flex-shrink-0
            ${unlocked ? "bg-[#00FF41]/20" : "bg-[#222222]"}
          `}
        >
          <Icon
            className={`${sizeConfig.icon} ${
              unlocked ? "text-[#00FF41]" : "text-gray-500"
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3
              className={`${sizeConfig.title} font-semibold ${
                unlocked ? "text-white" : "text-gray-500"
              }`}
            >
              {name}
            </h3>
            <span
              className={`${sizeConfig.points} font-bold ${
                unlocked ? "text-[#00FF41]" : "text-gray-600"
              }`}
            >
              +{points}
            </span>
          </div>
          <p
            className={`${sizeConfig.description} mt-1 ${
              unlocked ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {description}
          </p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

