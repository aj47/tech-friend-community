"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { RewardCard, RedemptionHistory } from "@/components/RewardCard";
import { PointsBadge, TierProgress } from "@/components/PointsBadge";
import { Gift, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RewardsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const rewards = useQuery(api.rewards.getRewards);
  const myRedemptions = useQuery(api.rewards.getMyRedemptions);
  const seedRewards = useMutation(api.rewards.seedRewards);

  const handleSeedRewards = async () => {
    try {
      await seedRewards({});
    } catch (err) {
      console.error("Failed to seed rewards:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Gift className="w-16 h-16 text-[#00FF41] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Sign in to view rewards
          </h1>
          <p className="text-gray-400 mb-8">
            Connect your GitHub account to redeem rewards with your earned
            points.
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

  const userPoints = currentUser.totalPoints || 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF41]/20 rounded-full mb-4">
            <Gift className="w-8 h-8 text-[#00FF41]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Rewards</h1>
          <p className="text-gray-400">
            Redeem your earned points for exclusive rewards
          </p>
        </div>

        {/* User Points Summary */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm mb-1">Your Balance</p>
              <p className="text-4xl font-bold text-[#00FF41]">
                {userPoints.toLocaleString()} points
              </p>
            </div>
            <PointsBadge
              points={userPoints}
              tier={(currentUser.tier as any) || "builder"}
              size="lg"
            />
          </div>
          <div className="mt-6">
            <TierProgress
              points={userPoints}
              tier={(currentUser.tier as any) || "builder"}
            />
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">
            Available Rewards
          </h2>
          {!rewards ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#00FF41] animate-spin" />
            </div>
          ) : rewards.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward._id}
                  reward={reward}
                  userPoints={userPoints}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#111111] border border-[#222222] rounded-lg">
              <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No rewards available yet</p>
              <button
                onClick={handleSeedRewards}
                className="px-4 py-2 bg-[#00FF41] text-black rounded-lg hover:bg-[#00DD35]"
              >
                Initialize Rewards
              </button>
            </div>
          )}
        </div>

        {/* Point Values */}
        <div className="mb-12 bg-[#111111] border border-[#222222] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            How to Earn Points
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#0A0A0A] rounded-lg">
              <p className="text-2xl font-bold text-[#00FF41] mb-1">50 pts</p>
              <p className="text-gray-400 text-sm">Merged PR</p>
            </div>
            <div className="text-center p-4 bg-[#0A0A0A] rounded-lg">
              <p className="text-2xl font-bold text-[#00FF41] mb-1">30 pts</p>
              <p className="text-gray-400 text-sm">Issue Fixed</p>
            </div>
            <div className="text-center p-4 bg-[#0A0A0A] rounded-lg">
              <p className="text-2xl font-bold text-[#00FF41] mb-1">20 pts</p>
              <p className="text-gray-400 text-sm">Feedback Accepted</p>
            </div>
          </div>
        </div>

        {/* Redemption History */}
        {myRedemptions && myRedemptions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">
              Your Redemptions
            </h2>
            <RedemptionHistory redemptions={myRedemptions} />
          </div>
        )}
      </div>
    </div>
  );
}
