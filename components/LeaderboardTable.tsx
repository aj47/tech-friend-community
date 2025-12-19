"use client";

import Link from "next/link";
import { Trophy, Medal, Award } from "lucide-react";
import { PointsBadge } from "./PointsBadge";
import type { Id } from "@/convex/_generated/dataModel";

interface LeaderboardUser {
  rank: number;
  _id: Id<"users"> | string;
  name?: string | null;
  githubUsername?: string | null;
  image?: string | null;
  totalPoints: number;
  tier: "builder" | "contributor" | "core" | "architect";
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId?: Id<"users">;
  isLoading?: boolean;
}

export function LeaderboardTable({
  users,
  currentUserId,
  isLoading,
}: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-[#111111] rounded-lg p-4 animate-pulse flex items-center space-x-4"
          >
            <div className="w-8 h-8 bg-[#222222] rounded-full" />
            <div className="w-10 h-10 bg-[#222222] rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#222222] rounded w-32" />
              <div className="h-3 bg-[#222222] rounded w-24" />
            </div>
            <div className="h-6 bg-[#222222] rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-[#111111] rounded-lg border border-[#222222]">
        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No contributors yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Be the first to contribute and earn points!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={String(user._id)}
          className={`bg-[#111111] border rounded-lg p-4 flex items-center space-x-4 transition-all ${
            currentUserId && String(user._id) === String(currentUserId)
              ? "border-[#00FF41]/50 bg-[#00FF41]/5"
              : "border-[#222222] hover:border-[#333333]"
          }`}
        >
          {/* Rank */}
          <div className="flex-shrink-0 w-10 text-center">
            {user.rank === 1 ? (
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />
            ) : user.rank === 2 ? (
              <Medal className="w-6 h-6 text-gray-400 mx-auto" />
            ) : user.rank === 3 ? (
              <Award className="w-6 h-6 text-orange-600 mx-auto" />
            ) : (
              <span className="text-lg font-bold text-gray-500">
                #{user.rank}
              </span>
            )}
          </div>

          {/* Avatar */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#00FF41]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#00FF41] font-bold">
                {(user.name || user.githubUsername || "?")[0].toUpperCase()}
              </span>
            </div>
          )}

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">
              {user.name || user.githubUsername}
            </p>
            <p className="text-gray-500 text-sm truncate">
              @{user.githubUsername || "unknown"}
            </p>
          </div>

          {/* Points & Tier */}
          <div className="flex-shrink-0">
            <PointsBadge
              points={user.totalPoints}
              tier={user.tier}
              size="sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardMini({
  users,
  title = "Top Contributors",
}: {
  users: LeaderboardUser[];
  title?: string;
}) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-[#00FF41]" />
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <Link
          href="/leaderboard"
          className="text-sm text-[#00FF41] hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-[#222222]">
        {users.slice(0, 5).map((user, index) => (
          <div
            key={String(user._id)}
            className="px-4 py-3 flex items-center space-x-3"
          >
            <span className="text-sm font-bold text-gray-500 w-6">
              #{index + 1}
            </span>
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                <span className="text-[#00FF41] text-sm font-bold">
                  {(user.name || user.githubUsername || "?")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.name || user.githubUsername}
              </p>
            </div>
            <span className="text-[#00FF41] font-bold text-sm">
              {user.totalPoints}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
