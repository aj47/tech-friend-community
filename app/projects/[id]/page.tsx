"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { ContributionForm } from "@/components/ContributionForm";
import { PointsBadge } from "@/components/PointsBadge";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Users,
  Check,
  X,
  Clock,
  GitPullRequest,
  MessageSquare,
  Bug,
  Tag,
  Pencil,
} from "lucide-react";
import Link from "next/link";

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

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.getProject, { projectId });
  const currentUser = useQuery(api.users.getCurrentUser);

  const [showContributionForm, setShowContributionForm] = useState(false);

  const verifyContribution = useMutation(api.contributions.verifyContribution);
  const rejectContribution = useMutation(api.contributions.rejectContribution);

  const isOwner = currentUser && project?.owner?._id === currentUser._id;

  const handleVerify = async (contributionId: Id<"contributions">) => {
    try {
      await verifyContribution({ contributionId });
    } catch (err) {
      console.error("Failed to verify contribution:", err);
    }
  };

  const handleReject = async (contributionId: Id<"contributions">) => {
    try {
      await rejectContribution({ contributionId });
    } catch (err) {
      console.error("Failed to reject contribution:", err);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#222222] rounded w-1/3" />
            <div className="h-4 bg-[#222222] rounded w-2/3" />
            <div className="h-40 bg-[#222222] rounded" />
          </div>
        </div>
      </div>
    );
  }

  const pendingContributions = project.contributions?.filter(
    (c) => c.status === "pending"
  );
  const verifiedContributions = project.contributions?.filter(
    (c) => c.status === "verified"
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to projects
        </Link>

        {/* Header */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {project.owner?.image ? (
                <img
                  src={project.owner.image}
                  alt={project.owner.name || "Owner"}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                  <span className="text-[#00FF41] font-bold text-lg">
                    {(project.owner?.name ||
                      project.owner?.githubUsername ||
                      "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                <p className="text-gray-500">
                  by @{project.owner?.githubUsername || "unknown"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isOwner && (
                <Link
                  href={`/projects/${projectId}/edit`}
                  className="inline-flex items-center px-3 py-1.5 bg-[#222222] text-gray-300 rounded-lg hover:bg-[#333333] hover:text-white transition-colors text-sm"
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
                  Edit
                </Link>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === "active"
                    ? "bg-[#00FF41]/20 text-[#00FF41]"
                    : project.status === "paused"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-gray-500/20 text-gray-500"
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>

          <p className="text-gray-300 mb-4">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[#1a1a1a] text-gray-400 text-sm rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-400 hover:text-[#00FF41]"
            >
              <GitBranch className="w-4 h-4 mr-1" />
              {project.githubRepoOwner}/{project.githubRepoName}
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <div className="flex items-center text-gray-400">
              <Users className="w-4 h-4 mr-1" />
              {project.contributions?.length || 0} contributions
            </div>
          </div>
        </div>

        {/* Help Wanted */}
        <div className="bg-[#111111] border border-[#00FF41]/30 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#00FF41] mb-3">
            Help Wanted
          </h2>
          <p className="text-gray-300">{project.helpWanted}</p>
        </div>

        {/* GitHub Issues */}
        {project.githubIssues && project.githubIssues.length > 0 && (
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Bug className="w-5 h-5 mr-2 text-[#00FF41]" />
              GitHub Issues ({project.githubIssues.length})
            </h2>
            <div className="space-y-3">
              {project.githubIssues.map((issue) => (
                <a
                  key={issue.number}
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[#0A0A0A] rounded-lg p-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          issue.state === "open"
                            ? "bg-[#00FF41]/20 text-[#00FF41]"
                            : "bg-purple-500/20 text-purple-400"
                        }`}>
                          {issue.state}
                        </span>
                        <span className="text-[#00FF41] font-medium">#{issue.number}</span>
                      </div>
                      <p className="text-white font-medium">{issue.title}</p>
                      {issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {issue.labels.map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center px-2 py-0.5 bg-[#222222] text-gray-400 text-xs rounded"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Submit Contribution Button */}
        {currentUser && !isOwner && project.status === "active" && (
          <div className="mb-8">
            {showContributionForm ? (
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Submit a Contribution
                </h2>
                <ContributionForm
                  projectId={projectId}
                  onSuccess={() => setShowContributionForm(false)}
                  onCancel={() => setShowContributionForm(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowContributionForm(true)}
                className="w-full py-4 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35] transition-colors"
              >
                Submit a Contribution
              </button>
            )}
          </div>
        )}

        {/* Pending Contributions (Owner View) */}
        {isOwner && pendingContributions && pendingContributions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-500" />
              Pending Verification ({pendingContributions.length})
            </h2>
            <div className="space-y-4">
              {pendingContributions.map((contribution) => {
                const Icon = TYPE_ICONS[contribution.type];
                return (
                  <div
                    key={contribution._id}
                    className="bg-[#111111] border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {contribution.contributor?.image ? (
                          <img
                            src={contribution.contributor.image}
                            alt={contribution.contributor.name || "User"}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                            <span className="text-[#00FF41] text-sm font-bold">
                              {(contribution.contributor?.name ||
                                contribution.contributor?.githubUsername ||
                                "?")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            @{contribution.contributor?.githubUsername || "unknown"}
                          </p>
                          <div className="flex items-center text-sm text-gray-400">
                            <Icon className="w-3 h-3 mr-1" />
                            {TYPE_LABELS[contribution.type]} • +
                            {contribution.pointsAwarded} pts
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={contribution.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#1a1a1a] text-gray-400 rounded hover:bg-[#222222]"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleVerify(contribution._id)}
                          className="p-2 bg-[#00FF41]/20 text-[#00FF41] rounded hover:bg-[#00FF41]/30"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(contribution._id)}
                          className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verified Contributions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Check className="w-5 h-5 mr-2 text-[#00FF41]" />
            Verified Contributions ({verifiedContributions?.length || 0})
          </h2>
          {verifiedContributions && verifiedContributions.length > 0 ? (
            <div className="space-y-3">
              {verifiedContributions.map((contribution) => {
                const Icon = TYPE_ICONS[contribution.type];
                return (
                  <div
                    key={contribution._id}
                    className="bg-[#111111] border border-[#222222] rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {contribution.contributor?.image ? (
                        <img
                          src={contribution.contributor.image}
                          alt={contribution.contributor.name || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                          <span className="text-[#00FF41] text-sm font-bold">
                            {(contribution.contributor?.name ||
                              contribution.contributor?.githubUsername ||
                              "?")[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">
                          @{contribution.contributor?.githubUsername || "unknown"}
                        </p>
                        <div className="flex items-center text-sm text-gray-400">
                          <Icon className="w-3 h-3 mr-1" />
                          {TYPE_LABELS[contribution.type]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-[#00FF41] font-bold">
                        +{contribution.pointsAwarded} pts
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-[#111111] border border-[#222222] rounded-lg">
              <p className="text-gray-500">No verified contributions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
