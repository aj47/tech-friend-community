"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Gift, Loader2, Check, MessageSquare, Video, Award } from "lucide-react";

interface RewardCardProps {
  reward: {
    _id: Id<"rewards">;
    name: string;
    description: string;
    pointsCost: number;
    type: "discord_role" | "shoutout" | "stream_feature";
    available: boolean;
  };
  userPoints: number;
  onRedeem?: () => void;
}

const TYPE_ICONS = {
  discord_role: Award,
  shoutout: MessageSquare,
  stream_feature: Video,
};

const TYPE_COLORS = {
  discord_role: "text-indigo-400",
  shoutout: "text-pink-400",
  stream_feature: "text-purple-400",
};

export function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redeemReward = useMutation(api.rewards.redeemReward);

  const canAfford = userPoints >= reward.pointsCost;
  const Icon = TYPE_ICONS[reward.type];

  const handleRedeem = async () => {
    if (!canAfford || isRedeeming || !reward.available) return;

    setIsRedeeming(true);
    setError(null);

    try {
      await redeemReward({ rewardId: reward._id });
      setRedeemed(true);
      onRedeem?.();
    } catch (err: any) {
      setError(err.message || "Failed to redeem reward");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (redeemed) {
    return (
      <div className="bg-[#111111] border border-[#00FF41]/50 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-[#00FF41]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-[#00FF41]" />
        </div>
        <h3 className="text-white font-semibold mb-2">Redeemed!</h3>
        <p className="text-gray-400 text-sm">
          {reward.name} has been redeemed. We&apos;ll fulfill it soon!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#111111] border rounded-lg p-6 transition-all ${
        canAfford && reward.available
          ? "border-[#222222] hover:border-[#00FF41]/50"
          : "border-[#222222] opacity-60"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          reward.type === "discord_role"
            ? "bg-indigo-400/20"
            : reward.type === "shoutout"
            ? "bg-pink-400/20"
            : "bg-purple-400/20"
        }`}
      >
        <Icon className={`w-6 h-6 ${TYPE_COLORS[reward.type]}`} />
      </div>

      {/* Info */}
      <h3 className="text-white font-semibold mb-2">{reward.name}</h3>
      <p className="text-gray-400 text-sm mb-4">{reward.description}</p>

      {/* Cost */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-sm">Cost</span>
        <span className="text-[#00FF41] font-bold text-lg">
          {reward.pointsCost} pts
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Redeem Button */}
      <button
        onClick={handleRedeem}
        disabled={!canAfford || isRedeeming || !reward.available}
        className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
          canAfford && reward.available
            ? "bg-[#00FF41] text-black hover:bg-[#00DD35]"
            : "bg-[#222222] text-gray-500 cursor-not-allowed"
        }`}
      >
        {isRedeeming ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redeeming...
          </>
        ) : !reward.available ? (
          "Not Available"
        ) : canAfford ? (
          <>
            <Gift className="w-4 h-4 mr-2" />
            Redeem
          </>
        ) : (
          `Need ${reward.pointsCost - userPoints} more pts`
        )}
      </button>
    </div>
  );
}

export function RedemptionHistory({
  redemptions,
}: {
  redemptions: Array<{
    _id: Id<"redemptions">;
    status: "pending" | "fulfilled";
    redeemedAt: number;
    fulfilledAt?: number;
    reward?: {
      name: string;
      type: string;
      pointsCost: number;
    } | null;
  }>;
}) {
  if (redemptions.length === 0) {
    return (
      <div className="text-center py-8 bg-[#111111] rounded-lg border border-[#222222]">
        <Gift className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No redemptions yet</p>
        <p className="text-gray-500 text-sm mt-1">
          Redeem rewards with your earned points
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {redemptions.map((redemption) => (
        <div
          key={redemption._id}
          className="bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h4 className="text-white font-medium">
              {redemption.reward?.name || "Unknown Reward"}
            </h4>
            <p className="text-gray-500 text-sm">
              {new Date(redemption.redeemedAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              redemption.status === "fulfilled"
                ? "bg-[#00FF41]/20 text-[#00FF41]"
                : "bg-yellow-500/20 text-yellow-500"
            }`}
          >
            {redemption.status === "fulfilled" ? "Fulfilled" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );
}
