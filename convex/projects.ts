import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Submit a new project
 */
export const submitProject = mutation({
  args: {
    githubRepoUrl: v.string(),
    githubRepoOwner: v.string(),
    githubRepoName: v.string(),
    title: v.string(),
    description: v.string(),
    helpWanted: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const projectId = await ctx.db.insert("projects", {
      ownerId: userId,
      githubRepoUrl: args.githubRepoUrl,
      githubRepoOwner: args.githubRepoOwner,
      githubRepoName: args.githubRepoName,
      title: args.title,
      description: args.description,
      helpWanted: args.helpWanted,
      tags: args.tags,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

/**
 * Get all projects with optional filters
 */
export const getProjects = query({
  args: {
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("completed"))
    ),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let projects;

    if (args.status) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_created_at")
        .order("desc")
        .collect();
    }

    // Filter by tag if provided
    if (args.tag) {
      projects = projects.filter((p) => p.tags.includes(args.tag!));
    }

    // Apply limit
    if (args.limit) {
      projects = projects.slice(0, args.limit);
    }

    // Fetch owner info for each project
    const projectsWithOwners = await Promise.all(
      projects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);
        const contributionCount = await ctx.db
          .query("contributions")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        return {
          ...project,
          owner: owner
            ? {
                _id: owner._id,
                name: owner.name,
                githubUsername: owner.githubUsername,
                image: owner.image,
              }
            : null,
          contributionCount: contributionCount.length,
        };
      })
    );

    return projectsWithOwners;
  },
});

/**
 * Get projects for the current user
 */
export const getMyProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const contributions = await ctx.db
          .query("contributions")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const pendingCount = contributions.filter(
          (c) => c.status === "pending"
        ).length;
        const verifiedCount = contributions.filter(
          (c) => c.status === "verified"
        ).length;

        return {
          ...project,
          contributionCount: contributions.length,
          pendingCount,
          verifiedCount,
        };
      })
    );

    return projectsWithStats;
  },
});

/**
 * Get a single project by ID
 */
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    const owner = await ctx.db.get(project.ownerId);
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const contributionsWithUsers = await Promise.all(
      contributions.map(async (contribution) => {
        const contributor = await ctx.db.get(contribution.contributorId);
        return {
          ...contribution,
          contributor: contributor
            ? {
                _id: contributor._id,
                name: contributor.name,
                githubUsername: contributor.githubUsername,
                image: contributor.image,
              }
            : null,
        };
      })
    );

    return {
      ...project,
      owner: owner
        ? {
            _id: owner._id,
            name: owner.name,
            githubUsername: owner.githubUsername,
            image: owner.image,
          }
        : null,
      contributions: contributionsWithUsers,
    };
  },
});

/**
 * Update a project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    helpWanted: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("completed"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== userId) {
      throw new Error("Not authorized to update this project");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.helpWanted !== undefined) updates.helpWanted = args.helpWanted;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.projectId, updates);
    return args.projectId;
  },
});

/**
 * Pause a project
 */
export const pauseProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== userId) {
      throw new Error("Not authorized to pause this project");
    }

    await ctx.db.patch(args.projectId, {
      status: "paused",
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

/**
 * Get featured projects for homepage
 */
export const getFeaturedProjects = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(limit);

    const projectsWithOwners = await Promise.all(
      projects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);
        const contributionCount = await ctx.db
          .query("contributions")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        return {
          ...project,
          owner: owner
            ? {
                _id: owner._id,
                name: owner.name,
                githubUsername: owner.githubUsername,
                image: owner.image,
              }
            : null,
          contributionCount: contributionCount.length,
        };
      })
    );

    return projectsWithOwners;
  },
});

/**
 * Get all unique tags from projects
 */
export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const allTags = projects.flatMap((p) => p.tags);
    return [...new Set(allTags)].sort();
  },
});
