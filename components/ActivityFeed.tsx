"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  GitPullRequest,
  CheckCircle,
  FolderPlus,
  Gift,
  ArrowUpCircle,
  Flame,
  Activity,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type ActivityType =
  | "contribution_submitted"
  | "contribution_verified"
  | "project_created"
  | "reward_redeemed"
  | "tier_upgraded"
  | "streak_milestone";

interface ActivityItem {
  _id: Id<"activityFeed">;
  type: ActivityType;
  userId: Id<"users">;
  relatedId?: string;
  message: string;
  createdAt: number;
  user: {
    _id: Id<"users">;
    name?: string | null;
    githubUsername?: string | null;
    image?: string | null;
    tier?: string;
  } | null;
}

interface ActivityFeedProps {
  compact?: boolean;
  limit?: number;
}

const activityConfig: Record<
  ActivityType,
  { icon: typeof GitPullRequest; color: string; bgColor: string }
> = {
  contribution_submitted: {
    icon: GitPullRequest,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  contribution_verified: {
    icon: CheckCircle,
    color: "text-[#00FF41]",
    bgColor: "bg-[#00FF41]/10",
  },
  project_created: {
    icon: FolderPlus,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  reward_redeemed: {
    icon: Gift,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  tier_upgraded: {
    icon: ArrowUpCircle,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  streak_milestone: {
    icon: Flame,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function ActivityFeed({ compact = false, limit = 10 }: ActivityFeedProps) {
  const activities = useQuery(api.activity.getRecentActivity, { limit });

  if (!activities) {
    return (
      <div className="space-y-3">
        {[...Array(compact ? 5 : limit)].map((_, i) => (
          <div
            key={i}
            className="bg-[#111111] rounded-lg p-3 animate-pulse flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-[#222222] rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#222222] rounded w-3/4" />
              <div className="h-2 bg-[#222222] rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 bg-[#111111] rounded-lg border border-[#222222]">
        <Activity className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No activity yet</p>
        <p className="text-gray-500 text-xs mt-1">
          Be the first to contribute!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity: ActivityItem) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;

        return (
          <div
            key={activity._id}
            className={`bg-[#111111] border border-[#222222] rounded-lg ${
              compact ? "p-2" : "p-3"
            } flex items-center space-x-3 hover:border-[#333333] transition-colors`}
          >
            {/* User Avatar */}
            {activity.user?.image ? (
              <img
                src={activity.user.image}
                alt={activity.user.name || "User"}
                className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-full flex-shrink-0`}
              />
            ) : (
              <div
                className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-full bg-[#00FF41]/20 flex items-center justify-center flex-shrink-0`}
              >
                <span className={`text-[#00FF41] font-bold ${compact ? "text-xs" : "text-sm"}`}>
                  {(activity.user?.name || activity.user?.githubUsername || "?")[0].toUpperCase()}
                </span>
              </div>
            )}

            {/* Activity Icon */}
            <div className={`${config.bgColor} ${compact ? "p-1" : "p-1.5"} rounded-full flex-shrink-0`}>
              <Icon className={`${config.color} ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className={`text-gray-300 ${compact ? "text-xs" : "text-sm"} truncate`}>
                {activity.message}
              </p>
            </div>

            {/* Time */}
            <span className={`text-gray-500 ${compact ? "text-xs" : "text-xs"} flex-shrink-0`}>
              {formatTimeAgo(activity.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Sidebar-friendly activity feed card
 */
export function ActivityFeedMini({ limit = 5 }: { limit?: number }) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#222222] flex items-center space-x-2">
        <Activity className="w-5 h-5 text-[#00FF41]" />
        <h3 className="font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="p-3">
        <ActivityFeed compact limit={limit} />
      </div>
    </div>
  );
}

