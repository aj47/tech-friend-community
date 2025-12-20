"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const COLORS = ["#00FF41", "#00DD35", "#ffffff", "#00FF41", "#00DD35"];

// Inject keyframes into document head
const KEYFRAMES_ID = "confetti-keyframes";
const injectKeyframes = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes confetti-fall {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
    @keyframes confetti-sway {
      0%, 100% { margin-left: 0; }
      50% { margin-left: 30px; }
    }
  `;
  document.head.appendChild(style);
};

export function Confetti({ onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    injectKeyframes();

    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      });
    }
    setParticles(newParticles);

    // Auto-dismiss after animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.id % 2 === 0 ? "50%" : "2px",
            animation: `confetti-fall ${particle.duration}s ease-out ${particle.delay}s forwards, confetti-sway ${particle.duration / 2}s ease-in-out ${particle.delay}s infinite`,
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: particle.color === "#00FF41" ? `0 0 6px ${particle.color}` : "none",
          }}
        />
      ))}
    </div>
  );
}

