"use client";

import Link from "next/link";
import { GitBranch, Users, ExternalLink } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface ProjectCardProps {
  project: {
    _id: Id<"projects">;
    title: string;
    description: string;
    githubRepoUrl: string;
    githubRepoOwner: string;
    githubRepoName: string;
    helpWanted: string;
    tags: string[];
    status: "active" | "paused" | "completed";
    owner?: {
      _id: Id<"users">;
      name?: string | null;
      githubUsername?: string | null;
      image?: string | null;
    } | null;
    contributionCount?: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project._id}`}>
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 hover:border-[#00FF41]/50 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {project.owner?.image ? (
              <img
                src={project.owner.image}
                alt={project.owner.name || "Owner"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                <span className="text-[#00FF41] font-bold">
                  {(project.owner?.name || project.owner?.githubUsername || "?")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-white font-semibold group-hover:text-[#00FF41] transition-colors">
                {project.title}
              </h3>
              <p className="text-gray-500 text-sm">
                @{project.owner?.githubUsername || "unknown"}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
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

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Help Wanted */}
        <div className="bg-[#0A0A0A] rounded-md p-3 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Help Wanted
          </p>
          <p className="text-gray-300 text-sm line-clamp-2">
            {project.helpWanted}
          </p>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[#1a1a1a] text-gray-400 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{project.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500">
              <GitBranch className="w-4 h-4 mr-1" />
              <span>
                {project.githubRepoOwner}/{project.githubRepoName}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span>{project.contributionCount || 0}</span>
            </div>
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#00FF41]"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </Link>
  );
}
