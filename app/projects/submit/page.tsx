"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Loader2, Link as LinkIcon, X, Plus, ArrowLeft, Check } from "lucide-react";
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

export default function SubmitProjectPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const submitProject = useMutation(api.projects.submitProject);
  const fetchRepoFromUrl = useAction(api.github.fetchRepoFromUrl);
  const fetchRepoIssues = useAction(api.github.fetchRepoIssues);

  const [repoUrl, setRepoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [helpWanted, setHelpWanted] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const [isFetchingRepo, setIsFetchingRepo] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    name: string;
    description: string;
    topics: string[];
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableIssues, setAvailableIssues] = useState<Array<{
    number: number;
    title: string;
    url: string;
    state: "open" | "closed";
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

  const handleFetchRepo = async () => {
    if (!repoUrl.trim() || !currentUser?.githubAccessToken) return;

    setIsFetchingRepo(true);
    setError(null);
    // Clear previous issue selections and available issues when fetching a new repo
    setSelectedIssues([]);
    setAvailableIssues([]);
    setIssuesFetchError(null);

    try {
      const info = await fetchRepoFromUrl({
        accessToken: currentUser.githubAccessToken,
        repoUrl: repoUrl.trim(),
      });

      setRepoInfo({
        owner: info.owner,
        name: info.name,
        description: info.description,
        topics: info.topics,
      });

      if (!title) setTitle(info.name);
      if (!description && info.description) setDescription(info.description);
      if (tags.length === 0 && info.topics.length > 0) {
        setTags(info.topics.slice(0, 5));
      }

      // Fetch issues after getting repo info
      handleFetchIssues(info.owner, info.name);
    } catch (err: any) {
      setError(err.message || "Failed to fetch repository info");
    } finally {
      setIsFetchingRepo(false);
    }
  };

  const handleFetchIssues = async (owner?: string, repo?: string) => {
    const issueOwner = owner || repoInfo?.owner;
    const issueRepo = repo || repoInfo?.name;

    if (!issueOwner || !issueRepo || !currentUser?.githubAccessToken) return;

    setIsFetchingIssues(true);
    setIssuesFetchError(null);
    try {
      const issues = await fetchRepoIssues({
        accessToken: currentUser.githubAccessToken,
        owner: issueOwner,
        repo: issueRepo,
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
          state: issue.state,
          labels: issue.labels,
        }];
      }
    });
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

    if (!repoInfo) {
      setError("Please fetch repository info first");
      return;
    }

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
      const projectId = await submitProject({
        githubRepoUrl: repoUrl.trim(),
        githubRepoOwner: repoInfo.owner,
        githubRepoName: repoInfo.name,
        title: title.trim(),
        description: description.trim(),
        helpWanted: helpWanted.trim(),
        tags,
        githubIssues: selectedIssues,
      });

      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit project");
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Sign in to submit a project
          </h1>
          <p className="text-gray-400 mb-8">
            You need to be signed in with GitHub to submit your project.
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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to projects
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Submit Your Project</h1>
        <p className="text-gray-400 mb-8">
          Share your GitHub project and describe what help you need from the
          community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GitHub Repo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Repository URL
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41]"
                />
              </div>
              <button
                type="button"
                onClick={handleFetchRepo}
                disabled={!repoUrl.trim() || isFetchingRepo}
                className="px-4 py-3 bg-[#222222] text-white rounded-lg hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isFetchingRepo ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Fetch"
                )}
              </button>
            </div>
            {repoInfo && (
              <p className="mt-2 text-sm text-[#00FF41]">
                Found: {repoInfo.owner}/{repoInfo.name}
              </p>
            )}
          </div>

          {/* GitHub Issues */}
          {repoInfo && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  GitHub Issues (Select issues you want help with)
                </label>
                <button
                  type="button"
                  onClick={() => handleFetchIssues()}
                  disabled={isFetchingIssues}
                  className="text-sm text-[#00FF41] hover:text-[#00DD35] disabled:opacity-50"
                >
                  {isFetchingIssues ? "Loading..." : "Refresh Issues"}
                </button>
              </div>

              {selectedIssues.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Selected ({selectedIssues.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssues.map((issue) => (
                      <span
                        key={issue.number}
                        className="inline-flex items-center px-3 py-1 bg-[#00FF41]/20 text-[#00FF41] rounded-full text-sm"
                      >
                        #{issue.number}: {issue.title.slice(0, 30)}{issue.title.length > 30 ? "..." : ""}
                        <button
                          type="button"
                          onClick={() => toggleIssue(issue as any)}
                          className="ml-2 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isFetchingIssues ? (
                <div className="flex items-center justify-center py-4 bg-[#111111] border border-[#333333] rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-400">Loading issues...</span>
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
                    onClick={() => handleFetchIssues()}
                    className="mt-2 text-sm text-[#00FF41] hover:text-[#00DD35]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center bg-[#111111] border border-[#333333] rounded-lg">
                  <p className="text-gray-500 text-sm">
                    {repoInfo ? "No open issues found in this repository" : "Fetch repo first to see issues"}
                  </p>
                </div>
              )}
            </div>
          )}

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
            <p className="mt-2 text-xs text-gray-500">
              Be specific! E.g., &quot;Need help with React performance optimization&quot;
              or &quot;Looking for feedback on the API design&quot;
            </p>
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
          <button
            type="submit"
            disabled={isSubmitting || !repoInfo}
            className="w-full py-4 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Project"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
