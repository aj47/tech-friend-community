"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { GitPullRequest, MessageSquare, Bug, Loader2 } from "lucide-react";

interface ContributionFormProps {
  projectId: Id<"projects">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CONTRIBUTION_TYPES = [
  {
    value: "pr_merged" as const,
    label: "Merged PR",
    description: "A pull request that was merged",
    points: 50,
    icon: GitPullRequest,
  },
  {
    value: "feedback_accepted" as const,
    label: "Feedback Accepted",
    description: "Helpful feedback or code review",
    points: 20,
    icon: MessageSquare,
  },
  {
    value: "issue_merged" as const,
    label: "Issue Fixed",
    description: "An issue you helped resolve",
    points: 30,
    icon: Bug,
  },
];

export function ContributionForm({
  projectId,
  onSuccess,
  onCancel,
}: ContributionFormProps) {
  const [type, setType] = useState<"pr_merged" | "feedback_accepted" | "issue_merged">("pr_merged");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContribution = useMutation(api.contributions.submitContribution);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!githubUrl.trim()) {
      setError("Please enter a GitHub URL");
      return;
    }

    // Basic URL validation
    if (!githubUrl.includes("github.com")) {
      setError("Please enter a valid GitHub URL");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContribution({
        projectId,
        type,
        githubUrl: githubUrl.trim(),
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to submit contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = CONTRIBUTION_TYPES.find((t) => t.value === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contribution Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Contribution Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CONTRIBUTION_TYPES.map((contributionType) => (
            <button
              key={contributionType.value}
              type="button"
              onClick={() => setType(contributionType.value)}
              className={`p-4 rounded-lg border text-left transition-all ${
                type === contributionType.value
                  ? "border-[#00FF41] bg-[#00FF41]/10"
                  : "border-[#333333] bg-[#111111] hover:border-[#444444]"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <contributionType.icon
                  className={`w-5 h-5 ${
                    type === contributionType.value
                      ? "text-[#00FF41]"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={`font-medium ${
                    type === contributionType.value
                      ? "text-[#00FF41]"
                      : "text-white"
                  }`}
                >
                  {contributionType.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {contributionType.description}
              </p>
              <p className="text-sm font-bold text-[#00FF41]">
                +{contributionType.points} pts
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* GitHub URL */}
      <div>
        <label
          htmlFor="githubUrl"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          GitHub URL
        </label>
        <input
          id="githubUrl"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/owner/repo/pull/123"
          className="w-full px-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41]"
        />
        <p className="mt-2 text-xs text-gray-500">
          Link to the PR, issue, or discussion where you contributed
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Points Preview */}
      <div className="bg-[#0A0A0A] rounded-lg p-4 flex items-center justify-between">
        <span className="text-gray-400">Points you&apos;ll earn (if verified)</span>
        <span className="text-2xl font-bold text-[#00FF41]">
          +{selectedType?.points || 0}
        </span>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-[#1a1a1a] text-gray-300 rounded-lg hover:bg-[#222222] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Contribution"
          )}
        </button>
      </div>
    </form>
  );
}
