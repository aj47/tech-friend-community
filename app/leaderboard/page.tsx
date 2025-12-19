"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Trophy } from "lucide-react";

type Period = "week" | "month" | "all";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");

  const leaderboard = useQuery(api.contributions.getLeaderboard, {
    limit: 50,
    period,
  });

  const currentUser = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.contributions.getContributionStats);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF41]/20 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-[#00FF41]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">
            Top contributors in the builder community
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00FF41]">
                {stats.totalBuilders}
              </p>
              <p className="text-gray-500 text-sm">Total Builders</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00FF41]">
                {stats.verifiedContributions}
              </p>
              <p className="text-gray-500 text-sm">Contributions</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00FF41]">
                {stats.totalPointsAwarded.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">Points Awarded</p>
            </div>
          </div>
        )}

        {/* Period Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#111111] border border-[#222222] rounded-lg p-1">
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === "week"
                  ? "bg-[#00FF41] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === "month"
                  ? "bg-[#00FF41] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === "all"
                  ? "bg-[#00FF41] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <LeaderboardTable
          users={leaderboard || []}
          currentUserId={currentUser?._id}
          isLoading={!leaderboard}
        />

        {/* Tier Info */}
        <div className="mt-12 bg-[#111111] border border-[#222222] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tier System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-gray-400">B</span>
              </div>
              <p className="text-white font-medium">Builder</p>
              <p className="text-gray-500 text-sm">0+ pts</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-400">C</span>
              </div>
              <p className="text-white font-medium">Contributor</p>
              <p className="text-gray-500 text-sm">100+ pts</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-400">C</span>
              </div>
              <p className="text-white font-medium">Core</p>
              <p className="text-gray-500 text-sm">500+ pts</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-[#00FF41]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-[#00FF41]">A</span>
              </div>
              <p className="text-white font-medium">Architect</p>
              <p className="text-gray-500 text-sm">1000+ pts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
