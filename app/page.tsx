"use client";

import Link from "next/link";
import { Hammer, Users, Gift, ArrowRight, Trophy, Zap, GitPullRequest } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { LeaderboardMini } from "@/components/LeaderboardTable";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const featuredProjects = useQuery(api.projects.getFeaturedProjects, { limit: 3 });
  const leaderboard = useQuery(api.users.getLeaderboard, { limit: 5 });
  const stats = useQuery(api.contributions.getContributionStats);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-full mb-6">
            <Hammer className="w-4 h-4 text-[#00FF41] mr-2" />
            <span className="text-[#00FF41] text-sm font-medium">
              Builder Community Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Builders helping{" "}
            <span className="text-[#00FF41]">builders</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Submit your projects, contribute to others, earn points, and unlock
            exclusive rewards. Join a community where developers help each other
            succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects/submit"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35] transition-colors"
            >
              Submit Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-8 py-3 border border-[#333333] text-white rounded-lg hover:border-[#00FF41] transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-[#00FF41]">
                {stats.totalBuilders}
              </p>
              <p className="text-gray-500 text-sm mt-1">Builders</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-[#00FF41]">
                {stats.activeProjects}
              </p>
              <p className="text-gray-500 text-sm mt-1">Active Projects</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-[#00FF41]">
                {stats.verifiedContributions}
              </p>
              <p className="text-gray-500 text-sm mt-1">Contributions</p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-[#00FF41]">
                {stats.totalPointsAwarded.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mt-1">Points Awarded</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          {/* Featured Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Projects Seeking Help
              </h2>
              <Link
                href="/projects"
                className="text-[#00FF41] hover:underline text-sm flex items-center"
              >
                View all
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {!featuredProjects ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#111111] border border-[#222222] rounded-lg p-6 animate-pulse"
                  >
                    <div className="h-4 bg-[#222222] rounded w-3/4 mb-4" />
                    <div className="h-3 bg-[#222222] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : featuredProjects.length > 0 ? (
              <div className="space-y-4">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-12 text-center">
                <Hammer className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No projects yet</p>
                <Link
                  href="/projects/submit"
                  className="inline-flex items-center px-4 py-2 bg-[#00FF41] text-black rounded-lg hover:bg-[#00DD35]"
                >
                  Submit the first project
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar - Leaderboard */}
          <div>
            {leaderboard && (
              <LeaderboardMini
                users={leaderboard}
                title="Top Contributors"
              />
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-white mb-2">Submit Your Project</h4>
              <p className="text-sm text-gray-500">
                Share your GitHub repo and describe what help you need
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-white mb-2">Contribute to Others</h4>
              <p className="text-sm text-gray-500">
                Help fellow builders with PRs, feedback, and bug fixes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-white mb-2">Earn Points</h4>
              <p className="text-sm text-gray-500">
                Get verified contributions and climb the leaderboard
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-white mb-2">Unlock Rewards</h4>
              <p className="text-sm text-gray-500">
                Redeem points for Discord roles, shoutouts, and more
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-[#111111] border border-[#222222] p-8 rounded-xl">
            <div className="bg-[#00FF41]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <GitPullRequest className="h-6 w-6 text-[#00FF41]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Contribution Tracking
            </h3>
            <p className="text-gray-500">
              Submit PRs, issues, and feedback. Project owners verify your
              contributions and you earn points automatically.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#222222] p-8 rounded-xl">
            <div className="bg-[#00FF41]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-[#00FF41]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Tier System
            </h3>
            <p className="text-gray-500">
              Progress through Builder, Contributor, Core, and Architect tiers
              as you earn more points.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#222222] p-8 rounded-xl">
            <div className="bg-[#00FF41]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Gift className="h-6 w-6 text-[#00FF41]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Real Rewards
            </h3>
            <p className="text-gray-500">
              Exchange points for Discord roles, social shoutouts (130k followers),
              and dedicated stream features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
