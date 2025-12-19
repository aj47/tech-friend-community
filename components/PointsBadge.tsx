"use client";

import { Zap, Star, Crown, Award } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  tier: "builder" | "contributor" | "core" | "architect";
  showPoints?: boolean;
  size?: "sm" | "md" | "lg";
}

const TIER_CONFIG = {
  builder: {
    label: "Builder",
    icon: Zap,
    color: "text-gray-400",
    bgColor: "bg-gray-400/20",
    borderColor: "border-gray-400/30",
  },
  contributor: {
    label: "Contributor",
    icon: Star,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    borderColor: "border-blue-400/30",
  },
  core: {
    label: "Core",
    icon: Award,
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    borderColor: "border-purple-400/30",
  },
  architect: {
    label: "Architect",
    icon: Crown,
    color: "text-[#00FF41]",
    bgColor: "bg-[#00FF41]/20",
    borderColor: "border-[#00FF41]/30",
  },
};

const SIZE_CONFIG = {
  sm: {
    container: "px-2 py-1",
    icon: "w-3 h-3",
    text: "text-xs",
    points: "text-xs",
  },
  md: {
    container: "px-3 py-1.5",
    icon: "w-4 h-4",
    text: "text-sm",
    points: "text-sm",
  },
  lg: {
    container: "px-4 py-2",
    icon: "w-5 h-5",
    text: "text-base",
    points: "text-base",
  },
};

export function PointsBadge({
  points,
  tier,
  showPoints = true,
  size = "md",
}: PointsBadgeProps) {
  const tierConfig = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = tierConfig.icon;

  return (
    <div
      className={`inline-flex items-center space-x-2 ${sizeConfig.container} rounded-full ${tierConfig.bgColor} border ${tierConfig.borderColor}`}
    >
      <Icon className={`${sizeConfig.icon} ${tierConfig.color}`} />
      <span className={`${sizeConfig.text} ${tierConfig.color} font-medium`}>
        {tierConfig.label}
      </span>
      {showPoints && (
        <>
          <span className="text-gray-600">|</span>
          <span className={`${sizeConfig.points} text-white font-bold`}>
            {points.toLocaleString()} pts
          </span>
        </>
      )}
    </div>
  );
}

export function TierProgress({
  points,
  tier,
}: {
  points: number;
  tier: "builder" | "contributor" | "core" | "architect";
}) {
  const thresholds = {
    builder: { min: 0, max: 100 },
    contributor: { min: 100, max: 500 },
    core: { min: 500, max: 1000 },
    architect: { min: 1000, max: Infinity },
  };

  const nextTiers = {
    builder: "contributor",
    contributor: "core",
    core: "architect",
    architect: null,
  };

  const currentThreshold = thresholds[tier];
  const nextTier = nextTiers[tier];

  if (!nextTier) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Max tier reached!</span>
          <span className="text-[#00FF41] font-bold">{points} pts</span>
        </div>
        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div className="h-full bg-[#00FF41] w-full" />
        </div>
      </div>
    );
  }

  const progress = Math.min(
    ((points - currentThreshold.min) / (currentThreshold.max - currentThreshold.min)) * 100,
    100
  );
  const pointsToNext = currentThreshold.max - points;

  const nextTierConfig = TIER_CONFIG[nextTier as keyof typeof TIER_CONFIG];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {pointsToNext} pts to {nextTierConfig.label}
        </span>
        <span className="text-white font-bold">{points} / {currentThreshold.max}</span>
      </div>
      <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#00FF41] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
