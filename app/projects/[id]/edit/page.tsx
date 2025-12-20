"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Loader2,
  X,
  Plus,
  Check,
  RefreshCw,
  Tag,
} from "lucide-react";
import Link from "next/link";

const SUGGESTED_TAGS = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "ai",
  "devops",
  "design",
  "documentation",
  "testing",
  "performance",
];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.getProject, { projectId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProject = useMutation(api.projects.updateProject);
  const fetchRepoIssues = useAction(api.github.fetchRepoIssues);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [helpWanted, setHelpWanted] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [status, setStatus] = useState<"active" | "paused" | "completed">("active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub Issues state
  const [availableIssues, setAvailableIssues] = useState<Array<{
    number: number;
    title: string;
    url: string;
    state: string;
    labels: string[];
    body: string;
    createdAt: string;
  }>>([]);
  const [selectedIssues, setSelectedIssues] = useState<Array<{
    number: number;
    title: string;
    url: string;
    state: "open" | "closed";
    labels: string[];
  }>>([]);
  const [isFetchingIssues, setIsFetchingIssues] = useState(false);
  const [issuesFetchError, setIssuesFetchError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize form with project data
  useEffect(() => {
    if (project && !hasInitialized) {
      setTitle(project.title);
      setDescription(project.description);
      setHelpWanted(project.helpWanted);
      setTags(project.tags);
      setStatus(project.status);
      setSelectedIssues((project.githubIssues || []).map(issue => ({
        ...issue,
        state: issue.state as "open" | "closed",
      })));
      setHasInitialized(true);
    }
  }, [project, hasInitialized]);

  const isOwner = currentUser && project?.owner?._id === currentUser._id;

  const handleFetchIssues = async () => {
    if (!project?.githubRepoOwner || !project?.githubRepoName || !currentUser?.githubAccessToken) return;

    setIsFetchingIssues(true);
    setIssuesFetchError(null);
    try {
      const issues = await fetchRepoIssues({
        accessToken: currentUser.githubAccessToken,
        owner: project.githubRepoOwner,
        repo: project.githubRepoName,
      });
      setAvailableIssues(issues);
    } catch (err: any) {
      console.error("Failed to fetch issues:", err);
      setAvailableIssues([]);
      setIssuesFetchError(err.message || "Failed to fetch issues from GitHub");
    } finally {
      setIsFetchingIssues(false);
    }
  };

  const toggleIssue = (issue: typeof availableIssues[0]) => {
    setSelectedIssues((prev) => {
      const isSelected = prev.some((i) => i.number === issue.number);
      if (isSelected) {
        return prev.filter((i) => i.number !== issue.number);
      } else {
        return [...prev, {
          number: issue.number,
          title: issue.title,
          url: issue.url,
          state: issue.state === "closed" ? "closed" : "open",
          labels: issue.labels,
        }];
      }
    });
  };

  const removeSelectedIssue = (issueNumber: number) => {
    setSelectedIssues(selectedIssues.filter((i) => i.number !== issueNumber));
  };

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 10) {
      setTags([...tags, normalizedTag]);
    }
    setCustomTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a project title");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a project description");
      return;
    }

    if (!helpWanted.trim()) {
      setError("Please describe what help you need");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateProject({
        projectId,
        title: title.trim(),
        description: description.trim(),
        helpWanted: helpWanted.trim(),
        tags,
        status,
        githubIssues: selectedIssues,
      });

      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update project");
      setIsSubmitting(false);
    }
  };

  // Loading state - project is undefined while loading
  if (project === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#222222] rounded w-1/3" />
            <div className="h-4 bg-[#222222] rounded w-2/3" />
            <div className="h-40 bg-[#222222] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Not found state - project is null when it doesn't exist
  if (project === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-400 mb-8">
            The project you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  // Loading state for currentUser
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#222222] rounded w-1/3" />
            <div className="h-4 bg-[#222222] rounded w-2/3" />
            <div className="h-40 bg-[#222222] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Not Authorized
          </h1>
          <p className="text-gray-400 mb-8">
            You can only edit projects that you own.
          </p>
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center px-6 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
          >
            Back to Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to project
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Edit Project</h1>
        <p className="text-gray-400 mb-8">
          Update your project details and manage GitHub issues.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository Info (Read-only) */}
          <div className="p-4 bg-[#111111] border border-[#333333] rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Repository</p>
            <p className="text-[#00FF41] font-medium">
              {project.githubRepoOwner}/{project.githubRepoName}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Status
            </label>
            <div className="flex gap-3">
              {(["active", "paused", "completed"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === s
                      ? s === "active"
                        ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]"
                        : s === "paused"
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500"
                      : "bg-[#1a1a1a] text-gray-400 border border-[#333333] hover:border-gray-500"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full px-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your project about?"
              rows={4}
              className="w-full px-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] resize-none"
            />
          </div>

          {/* Help Wanted */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What Help Do You Need?
            </label>
            <textarea
              value={helpWanted}
              onChange={(e) => setHelpWanted(e.target.value)}
              placeholder="Describe what kind of contributions you're looking for..."
              rows={3}
              className="w-full px-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] resize-none"
            />
          </div>

          {/* GitHub Issues */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                GitHub Issues (Select issues you want help with)
              </label>
              <button
                type="button"
                onClick={handleFetchIssues}
                disabled={isFetchingIssues}
                className="inline-flex items-center text-sm text-[#00FF41] hover:text-[#00DD35] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isFetchingIssues ? "animate-spin" : ""}`} />
                {isFetchingIssues ? "Loading..." : "Refresh from GitHub"}
              </button>
            </div>

            {/* Currently selected issues */}
            {selectedIssues.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Current issues ({selectedIssues.length}):</p>
                <div className="space-y-2">
                  {selectedIssues.map((issue) => (
                    <div
                      key={issue.number}
                      className="flex items-center justify-between p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            issue.state === "open"
                              ? "bg-[#00FF41]/20 text-[#00FF41]"
                              : "bg-purple-500/20 text-purple-400"
                          }`}>
                            {issue.state}
                          </span>
                          <span className="text-[#00FF41] font-medium">#{issue.number}</span>
                        </div>
                        <p className="text-white text-sm mt-1 truncate">{issue.title}</p>
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {issue.labels.slice(0, 3).map((label) => (
                              <span key={label} className="inline-flex items-center px-1.5 py-0.5 bg-[#222222] text-gray-400 text-xs rounded">
                                <Tag className="w-2.5 h-2.5 mr-0.5" />
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedIssue(issue.number)}
                        className="ml-3 p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available issues from GitHub */}
            {isFetchingIssues ? (
              <div className="flex items-center justify-center py-4 bg-[#111111] border border-[#333333] rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-400">Loading issues from GitHub...</span>
              </div>
            ) : availableIssues.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-[#333333] rounded-lg divide-y divide-[#333333]">
                {availableIssues.map((issue) => {
                  const isSelected = selectedIssues.some((i) => i.number === issue.number);
                  return (
                    <button
                      key={issue.number}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`w-full text-left p-3 hover:bg-[#1a1a1a] transition-colors ${
                        isSelected ? "bg-[#00FF41]/10" : "bg-[#111111]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isSelected ? "text-[#00FF41]" : "text-white"}`}>
                            #{issue.number}: {issue.title}
                          </p>
                          {issue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {issue.labels.slice(0, 3).map((label) => (
                                <span key={label} className="px-1.5 py-0.5 bg-[#222222] text-gray-400 text-xs rounded">
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-[#00FF41] flex-shrink-0 ml-2" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : issuesFetchError ? (
              <div className="py-4 text-center bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{issuesFetchError}</p>
                <button
                  type="button"
                  onClick={handleFetchIssues}
                  className="mt-2 text-sm text-[#00FF41] hover:text-[#00DD35]"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="py-4 text-center bg-[#111111] border border-[#333333] rounded-lg">
                <p className="text-gray-500 text-sm">
                  Click &quot;Refresh from GitHub&quot; to load available issues
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-[#00FF41]/20 text-[#00FF41] rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(customTag);
                  }
                }}
                placeholder="Add custom tag"
                className="flex-1 px-4 py-2 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] text-sm"
              />
              <button
                type="button"
                onClick={() => addTag(customTag)}
                disabled={!customTag.trim()}
                className="px-3 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-3 py-1 bg-[#1a1a1a] text-gray-400 rounded-full text-sm hover:bg-[#222222]"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href={`/projects/${projectId}`}
              className="flex-1 py-4 bg-[#222222] text-white font-medium rounded-lg hover:bg-[#333333] text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
