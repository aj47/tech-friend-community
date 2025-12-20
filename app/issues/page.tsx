"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Search, ExternalLink, GitBranch, Tag } from "lucide-react";
import Link from "next/link";

export default function BrowseIssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allIssues = useQuery(api.projects.getAllIssues, {
    tag: selectedTag || undefined,
  });
  const allTags = useQuery(api.projects.getAllTags);

  // Client-side search filter
  const filteredIssues = allIssues?.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.issue.title.toLowerCase().includes(query) ||
      item.projectTitle.toLowerCase().includes(query) ||
      item.issue.labels.some((label) => label.toLowerCase().includes(query)) ||
      item.githubRepoName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Issues</h1>
          <p className="text-gray-400">
            Find specific GitHub issues from community projects that need help
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search issues by title, project, or label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41]"
          />
        </div>

        {/* Tags */}
        {allTags && allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === null
                  ? "bg-[#00FF41] text-black"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222222]"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? "bg-[#00FF41] text-black"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222222]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Issues List */}
        {!allIssues ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-[#111111] border border-[#222222] rounded-lg p-6 animate-pulse"
              >
                <div className="h-5 bg-[#222222] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#222222] rounded w-1/2 mb-2" />
                <div className="h-3 bg-[#222222] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredIssues && filteredIssues.length > 0 ? (
          <div className="space-y-4">
            {filteredIssues.map((item) => (
              <div
                key={`${item.projectId}-${item.issue.number}`}
                className="bg-[#111111] border border-[#222222] rounded-lg p-6 hover:border-[#00FF41]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={item.issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-white hover:text-[#00FF41] transition-colors inline-flex items-center gap-2"
                    >
                      <span className="text-[#00FF41]">#{item.issue.number}</span>
                      {item.issue.title}
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Labels */}
                {item.issue.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.issue.labels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center px-2 py-0.5 bg-[#222222] text-gray-300 text-xs rounded"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Project Info */}
                <div className="flex items-center justify-between text-sm">
                  <Link
                    href={`/projects/${item.projectId}`}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {item.owner?.image ? (
                      <img
                        src={item.owner.image}
                        alt={item.owner.name || "Owner"}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#00FF41]/20 flex items-center justify-center mr-2">
                        <span className="text-[#00FF41] text-xs font-bold">
                          {(item.owner?.name || item.owner?.githubUsername || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span>{item.projectTitle}</span>
                  </Link>
                  <a
                    href={item.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <GitBranch className="w-4 h-4 mr-1" />
                    {item.githubRepoOwner}/{item.githubRepoName}
                  </a>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#222222]">
                    {item.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-[#1a1a1a] text-gray-500 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#111111] border border-[#222222] rounded-lg">
            <p className="text-gray-400 mb-2">
              {searchQuery || selectedTag
                ? "No issues match your search"
                : "No issues available yet"}
            </p>
            <p className="text-gray-500 text-sm">
              {!searchQuery && !selectedTag && (
                <>
                  Issues will appear here when project owners submit their projects with GitHub issues.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

