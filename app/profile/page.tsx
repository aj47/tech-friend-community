"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { PointsBadge, TierProgress } from "@/components/PointsBadge";
import { ProjectCard } from "@/components/ProjectCard";
import Link from "next/link";
import {
  GitPullRequest,
  MessageSquare,
  Bug,
  ExternalLink,
  Plus,
  ArrowRight,
} from "lucide-react";

const TYPE_ICONS = {
  pr_merged: GitPullRequest,
  feedback_accepted: MessageSquare,
  issue_merged: Bug,
};

const TYPE_LABELS = {
  pr_merged: "Merged PR",
  feedback_accepted: "Feedback",
  issue_merged: "Issue Fixed",
};

export default function ProfilePage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const userStats = useQuery(
    api.users.getUserStats,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const myProjects = useQuery(api.projects.getMyProjects);
  const myContributions = useQuery(api.contributions.getMyContributions);
  const myRedemptions = useQuery(api.rewards.getMyRedemptions);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Sign in to view your profile
          </h1>
          <p className="text-gray-400 mb-8">
            Connect your GitHub account to track your contributions and rewards.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
          >
            Sign in with GitHub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {currentUser.image ? (
                <img
                  src={currentUser.image}
                  alt={currentUser.name || "User"}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                  <span className="text-[#00FF41] font-bold text-3xl">
                    {(currentUser.name ||
                      currentUser.githubUsername ||
                      "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {currentUser.name || currentUser.githubUsername}
                </h1>
                <p className="text-gray-400">@{currentUser.githubUsername}</p>
                <div className="mt-2">
                  <PointsBadge
                    points={currentUser.totalPoints || 0}
                    tier={(currentUser.tier as any) || "builder"}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/rewards"
                className="px-4 py-2 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
              >
                Redeem Rewards
              </Link>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="mt-6">
            <TierProgress
              points={currentUser.totalPoints || 0}
              tier={(currentUser.tier as any) || "builder"}
            />
          </div>
        </div>

        {/* Stats Grid */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00FF41]">
                {userStats.stats.projectsSubmitted}
              </p>
              <p className="text-gray-500 text-sm">Projects</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00FF41]">
                {userStats.stats.contributionsMade}
              </p>
              <p className="text-gray-500 text-sm">Contributions</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00FF41]">
                {userStats.stats.pointsEarned}
              </p>
              <p className="text-gray-500 text-sm">Points Earned</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#00FF41]">
                {userStats.stats.rewardsRedeemed}
              </p>
              <p className="text-gray-500 text-sm">Rewards Claimed</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">My Projects</h2>
              <Link
                href="/projects/submit"
                className="text-[#00FF41] hover:underline text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Submit new
              </Link>
            </div>
            {!myProjects ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-[#111111] border border-[#222222] rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-[#222222] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#222222] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : myProjects.length > 0 ? (
              <div className="space-y-3">
                {myProjects.slice(0, 3).map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="block bg-[#111111] border border-[#222222] rounded-lg p-4 hover:border-[#00FF41]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{project.title}</h3>
                        <p className="text-gray-500 text-sm">
                          {project.contributionCount} contributions •{" "}
                          {project.pendingCount} pending
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          project.status === "active"
                            ? "bg-[#00FF41]/20 text-[#00FF41]"
                            : "bg-gray-500/20 text-gray-500"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </Link>
                ))}
                {myProjects.length > 3 && (
                  <Link
                    href="/projects?owner=me"
                    className="block text-center text-[#00FF41] hover:underline text-sm py-2"
                  >
                    View all {myProjects.length} projects
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#111111] border border-[#222222] rounded-lg">
                <p className="text-gray-500 mb-4">No projects yet</p>
                <Link
                  href="/projects/submit"
                  className="inline-flex items-center px-4 py-2 bg-[#00FF41] text-black rounded-lg hover:bg-[#00DD35]"
                >
                  Submit your first project
                </Link>
              </div>
            )}
          </div>

          {/* My Contributions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                My Contributions
              </h2>
              <Link
                href="/projects"
                className="text-[#00FF41] hover:underline text-sm flex items-center"
              >
                Find projects
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            {!myContributions ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-[#111111] border border-[#222222] rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-[#222222] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#222222] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : myContributions.length > 0 ? (
              <div className="space-y-3">
                {myContributions.slice(0, 5).map((contribution) => {
                  const Icon = TYPE_ICONS[contribution.type];
                  return (
                    <div
                      key={contribution._id}
                      className="bg-[#111111] border border-[#222222] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-medium">
                              {TYPE_LABELS[contribution.type]}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm mt-1">
                            {contribution.project?.title || "Unknown project"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              contribution.status === "verified"
                                ? "bg-[#00FF41]/20 text-[#00FF41]"
                                : contribution.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {contribution.status}
                          </span>
                          <span className="text-[#00FF41] font-bold">
                            +{contribution.pointsAwarded}
                          </span>
                          <a
                            href={contribution.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#111111] border border-[#222222] rounded-lg">
                <p className="text-gray-500 mb-4">No contributions yet</p>
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2 bg-[#00FF41] text-black rounded-lg hover:bg-[#00DD35]"
                >
                  Start contributing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Redemptions */}
        {myRedemptions && myRedemptions.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Reward Redemptions
              </h2>
              <Link
                href="/rewards"
                className="text-[#00FF41] hover:underline text-sm"
              >
                View rewards
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRedemptions.slice(0, 3).map((redemption) => (
                <div
                  key={redemption._id}
                  className="bg-[#111111] border border-[#222222] rounded-lg p-4"
                >
                  <h3 className="text-white font-medium">
                    {redemption.reward?.name || "Unknown reward"}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(redemption.redeemedAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      redemption.status === "fulfilled"
                        ? "bg-[#00FF41]/20 text-[#00FF41]"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {redemption.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
