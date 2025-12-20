"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, X } from "lucide-react";

interface CelebrationToastProps {
  id: string;
  icon?: React.ReactNode;
  title: string;
  message: string;
  points?: number;
  onDismiss: (id: string) => void;
}

export function CelebrationToast({
  id,
  icon,
  title,
  message,
  points,
  onDismiss,
}: CelebrationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  }, [id, onDismiss]);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [handleDismiss]);

  return (
    <div
      className={`
        w-80 bg-[#111111] border border-[#333333] rounded-lg p-4 shadow-xl
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      style={{
        boxShadow: "0 0 20px rgba(0, 255, 65, 0.1)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 bg-[#00FF41]/20 rounded-full flex items-center justify-center flex-shrink-0">
          {icon || <Trophy className="w-5 h-5 text-[#00FF41]" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-white font-semibold truncate">{title}</h4>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">{message}</p>
          {points !== undefined && points > 0 && (
            <p
              className="text-[#00FF41] text-sm font-bold mt-2"
              style={{ textShadow: "0 0 10px #00FF41" }}
            >
              +{points} points
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    icon?: React.ReactNode;
    title: string;
    message: string;
    points?: number;
  }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <CelebrationToast
          key={toast.id}
          id={toast.id}
          icon={toast.icon}
          title={toast.title}
          message={toast.message}
          points={toast.points}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

