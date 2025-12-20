"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  // Next.js requires `useSearchParams()` to be wrapped in a Suspense boundary.
  return (
    <Suspense fallback={<ProjectsPageLoading />}>
      <ProjectsPageContent />
    </Suspense>
  );
}

function ProjectsPageLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 text-[#00FF41] animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading projects...</p>
      </div>
    </div>
  );
}

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const ownerParam = searchParams?.get("owner");
  const ownerMeView = ownerParam === "me";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "paused" | "completed" | "all">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const projects = useQuery(api.projects.getProjects, {
    status: statusFilter === "all" ? undefined : statusFilter,
    tag: selectedTag || undefined,
  });

  const allTags = useQuery(api.projects.getAllTags);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (ownerMeView && currentUser === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-10 h-10 text-[#00FF41] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (ownerMeView && currentUser === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Sign in to view your projects
          </h1>
          <p className="text-gray-400 mb-8">
            Your projects list is tied to your GitHub account.
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

  // Client-side search filter
  const filteredProjects = projects?.filter((project) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.githubRepoName.toLowerCase().includes(query) ||
      project.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const visibleProjects = ownerMeView && currentUser
    ? filteredProjects?.filter((p) => String(p.ownerId) === String(currentUser._id))
    : filteredProjects;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {ownerMeView ? "My Projects" : "Projects"}
            </h1>
            <p className="text-gray-400">
              {ownerMeView
                ? "Manage your submitted projects and review contributions"
                : "Find projects that need your help and start contributing"}
            </p>
          </div>
          <Link
            href={currentUser ? "/projects/submit" : "/auth/signin"}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35] transition-colors"
            title={currentUser ? "Submit a project" : "Sign in to submit a project"}
          >
            <Plus className="w-4 h-4 mr-2" />
            {currentUser ? "Submit Project" : "Sign in to submit"}
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "active" | "paused" | "completed" | "all"
                )
              }
              className="px-4 py-3 bg-[#111111] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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

        {/* Projects Grid */}
        {!projects ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[#111111] border border-[#222222] rounded-lg p-6 animate-pulse"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#222222] rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#222222] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#222222] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-[#222222] rounded w-full mb-2" />
                <div className="h-3 bg-[#222222] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : visibleProjects && visibleProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {visibleProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#111111] border border-[#222222] rounded-lg">
            <p className="text-gray-400 mb-4">
              {searchQuery || selectedTag
                ? "No projects match your search"
                : ownerMeView
                ? "You haven't submitted any projects yet"
                : "No projects available"}
            </p>
            {!searchQuery && !selectedTag && (
              <Link
                href={currentUser ? "/projects/submit" : "/auth/signin"}
                className="inline-flex items-center px-4 py-2 bg-[#00FF41] text-black rounded-lg hover:bg-[#00DD35]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {currentUser ? "Submit your first project" : "Sign in to submit"}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
