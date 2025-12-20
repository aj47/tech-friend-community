"use client";

import { useEffect, useState } from "react";
import { Zap, Star, Award, Crown, X } from "lucide-react";

type Tier = "builder" | "contributor" | "core" | "architect";

interface LevelUpModalProps {
  newTier: Tier;
  onClose: () => void;
  showConfetti?: () => void;
}

const TIER_CONFIG = {
  builder: {
    label: "Builder",
    icon: Zap,
    color: "text-gray-400",
    bgColor: "bg-gray-400/20",
    borderColor: "border-gray-400/50",
    glowColor: "gray",
  },
  contributor: {
    label: "Contributor",
    icon: Star,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    borderColor: "border-blue-400/50",
    glowColor: "#3b82f6",
  },
  core: {
    label: "Core Member",
    icon: Award,
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    borderColor: "border-purple-400/50",
    glowColor: "#a855f7",
  },
  architect: {
    label: "Architect",
    icon: Crown,
    color: "text-[#00FF41]",
    bgColor: "bg-[#00FF41]/20",
    borderColor: "border-[#00FF41]/50",
    glowColor: "#00FF41",
  },
};

// Inject keyframes into document head
const KEYFRAMES_ID = "levelup-modal-keyframes";
const injectKeyframes = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes badge-appear {
      0% { opacity: 0; transform: scale(0.3) rotate(-20deg); }
      50% { transform: scale(1.1) rotate(5deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 20px var(--glow-color), 0 0 40px var(--glow-color); }
      50% { box-shadow: 0 0 40px var(--glow-color), 0 0 80px var(--glow-color); }
    }
  `;
  document.head.appendChild(style);
};

export function LevelUpModal({ newTier, onClose, showConfetti }: LevelUpModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const tierConfig = TIER_CONFIG[newTier];
  const Icon = tierConfig.icon;

  useEffect(() => {
    injectKeyframes();
    // Trigger animation on mount
    setIsAnimating(true);
    // Trigger confetti if provided
    showConfetti?.();
  }, [showConfetti]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#111111] border border-[#333333] rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div
          className={`w-24 h-24 ${tierConfig.bgColor} ${tierConfig.borderColor} border-2 rounded-full flex items-center justify-center mx-auto mb-6`}
          style={{
            animation: isAnimating ? "badge-appear 0.6s ease-out forwards, glow-pulse 2s ease-in-out infinite" : "none",
            // @ts-expect-error CSS custom property
            "--glow-color": tierConfig.glowColor,
          }}
        >
          <Icon className={`w-12 h-12 ${tierConfig.color}`} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">Level Up!</h2>

        {/* Tier name */}
        <p className={`text-xl font-semibold ${tierConfig.color} mb-4`}>
          You&apos;re now a {tierConfig.label}!
        </p>

        {/* Description */}
        <p className="text-gray-400 mb-8">
          Congratulations! You&apos;ve unlocked new rewards and recognition in the community.
        </p>

        {/* Continue button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg font-medium bg-[#00FF41] text-black hover:bg-[#00DD35] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

