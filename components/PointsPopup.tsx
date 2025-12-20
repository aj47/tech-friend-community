"use client";

import { useEffect, useState } from "react";

interface PointsPopupProps {
  points: number;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

// Inject keyframes into document head
const KEYFRAMES_ID = "points-popup-keyframes";
const injectKeyframes = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes points-popup {
      0% { opacity: 0; transform: scale(0.5) translateY(0); }
      20% { opacity: 1; transform: scale(1.2) translateY(-10px); }
      40% { transform: scale(1) translateY(-20px); }
      100% { opacity: 0; transform: scale(0.8) translateY(-60px); }
    }
  `;
  document.head.appendChild(style);
};

export function PointsPopup({ points, position, onComplete }: PointsPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    injectKeyframes();

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const positionStyle = position
    ? { left: position.x, top: position.y }
    : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className="absolute text-center"
        style={{
          ...positionStyle,
          animation: "points-popup 1.5s ease-out forwards",
        }}
      >
        <span
          className="text-3xl font-bold text-[#00FF41]"
          style={{
            textShadow: "0 0 20px #00FF41, 0 0 40px #00FF41, 0 0 60px #00DD35",
          }}
        >
          +{points} points
        </span>
      </div>
    </div>
  );
}

