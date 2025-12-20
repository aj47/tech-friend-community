"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Confetti } from "./Confetti";
import { PointsPopup } from "./PointsPopup";
import { LevelUpModal } from "./LevelUpModal";
import { ToastContainer } from "./CelebrationToast";

type Tier = "builder" | "contributor" | "core" | "architect";

interface PointsPopupData {
  id: string;
  points: number;
  position?: { x: number; y: number };
}

interface ToastData {
  id: string;
  icon?: ReactNode;
  title: string;
  message: string;
  points?: number;
}

interface CelebrationContextValue {
  showPointsPopup: (points: number, position?: { x: number; y: number }) => void;
  showLevelUp: (newTier: Tier) => void;
  showConfetti: () => void;
  showToast: (options: { icon?: ReactNode; title: string; message: string; points?: number }) => void;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return context;
}

interface CelebrationProviderProps {
  children: ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [showingConfetti, setShowingConfetti] = useState(false);
  const [pointsPopups, setPointsPopups] = useState<PointsPopupData[]>([]);
  const [levelUpTier, setLevelUpTier] = useState<Tier | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showConfetti = useCallback(() => {
    setShowingConfetti(true);
  }, []);

  const hideConfetti = useCallback(() => {
    setShowingConfetti(false);
  }, []);

  const showPointsPopup = useCallback((points: number, position?: { x: number; y: number }) => {
    const id = `points-${Date.now()}-${Math.random()}`;
    setPointsPopups((prev) => [...prev, { id, points, position }]);
  }, []);

  const removePointsPopup = useCallback((id: string) => {
    setPointsPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const showLevelUp = useCallback((newTier: Tier) => {
    setLevelUpTier(newTier);
  }, []);

  const hideLevelUp = useCallback(() => {
    setLevelUpTier(null);
  }, []);

  const showToast = useCallback(
    (options: { icon?: ReactNode; title: string; message: string; points?: number }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, ...options }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: CelebrationContextValue = {
    showPointsPopup,
    showLevelUp,
    showConfetti,
    showToast,
  };

  return (
    <CelebrationContext.Provider value={value}>
      {children}

      {/* Confetti overlay */}
      {showingConfetti && <Confetti onComplete={hideConfetti} />}

      {/* Points popups */}
      {pointsPopups.map((popup) => (
        <PointsPopup
          key={popup.id}
          points={popup.points}
          position={popup.position}
          onComplete={() => removePointsPopup(popup.id)}
        />
      ))}

      {/* Level up modal */}
      {levelUpTier && (
        <LevelUpModal
          newTier={levelUpTier}
          onClose={hideLevelUp}
          showConfetti={showConfetti}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </CelebrationContext.Provider>
  );
}

