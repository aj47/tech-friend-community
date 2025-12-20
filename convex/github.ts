import { action } from "./_generated/server";
import { v } from "convex/values";
import { Octokit } from "octokit";

/**
 * Parse GitHub repo URL to get owner and name
 */
function parseGitHubRepoUrl(url: string): { owner: string; name: string } | null {
  try {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\?#]+)/,
      /github\.com:([^\/]+)\/([^\/\?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          name: match[2].replace(/\.git$/, ""),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch repository info from URL
 */
export const fetchRepoFromUrl = action({
  args: {
    accessToken: v.string(),
    repoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const parsed = parseGitHubRepoUrl(args.repoUrl);
      if (!parsed) {
        throw new Error("Invalid GitHub repository URL");
      }

      const octokit = new Octokit({ auth: args.accessToken });

      const { data } = await octokit.rest.repos.get({
        owner: parsed.owner,
        repo: parsed.name,
      });

      return {
        owner: data.owner.login,
        name: data.name,
        fullName: data.full_name,
        description: data.description || "",
        url: data.html_url,
        isPrivate: data.private,
        language: data.language,
        stargazersCount: data.stargazers_count,
        forksCount: data.forks_count,
        openIssuesCount: data.open_issues_count,
        topics: data.topics || [],
      };
    } catch (error: any) {
      console.error("Error fetching repository:", error);
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  },
});

/**
 * Fetch user's GitHub repositories
 */
export const fetchUserRepositories = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });

      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
      });

      return data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        isPrivate: repo.private,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        openIssuesCount: repo.open_issues_count,
        topics: repo.topics || [],
      }));
    } catch (error: any) {
      console.error("Error fetching repositories:", error);
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  },
});

/**
 * Verify a GitHub URL belongs to a project's repository
 */
export const verifyContributionUrl = action({
  args: {
    accessToken: v.string(),
    contributionUrl: v.string(),
    projectRepoOwner: v.string(),
    projectRepoName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Parse the contribution URL (PR or Issue)
      const prMatch = args.contributionUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/
      );
      const issueMatch = args.contributionUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/
      );

      if (!prMatch && !issueMatch) {
        return {
          valid: false,
          error: "URL is not a valid GitHub PR or issue link",
        };
      }

      const match = prMatch || issueMatch;
      const [, owner, repo, number] = match!;

      // Check if URL belongs to the project repo
      if (
        owner.toLowerCase() !== args.projectRepoOwner.toLowerCase() ||
        repo.toLowerCase() !== args.projectRepoName.toLowerCase()
      ) {
        return {
          valid: false,
          error: "This contribution is not for the specified project repository",
        };
      }

      const octokit = new Octokit({ auth: args.accessToken });

      if (prMatch) {
        // Verify PR exists and is merged
        const { data: pr } = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: parseInt(number),
        });

        return {
          valid: true,
          type: "pr",
          number: pr.number,
          title: pr.title,
          state: pr.state,
          merged: pr.merged,
          url: pr.html_url,
        };
      } else {
        // Verify issue exists
        const { data: issue } = await octokit.rest.issues.get({
          owner,
          repo,
          issue_number: parseInt(number),
        });

        return {
          valid: true,
          type: "issue",
          number: issue.number,
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
        };
      }
    } catch (error: any) {
      console.error("Error verifying contribution URL:", error);
      return {
        valid: false,
        error: `Failed to verify URL: ${error.message}`,
      };
    }
  },
});

/**
 * Get authenticated user's GitHub profile
 */
export const fetchGitHubUser = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });

      const { data } = await octokit.rest.users.getAuthenticated();

      return {
        id: data.id,
        login: data.login,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        publicRepos: data.public_repos,
      };
    } catch (error: any) {
      console.error("Error fetching GitHub user:", error);
      throw new Error(`Failed to fetch GitHub user: ${error.message}`);
    }
  },
});

/**
 * Fetch open issues from a repository
 */
export const fetchRepoIssues = action({
  args: {
    accessToken: v.string(),
    owner: v.string(),
    repo: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: args.accessToken });

      const { data } = await octokit.rest.issues.listForRepo({
        owner: args.owner,
        repo: args.repo,
        state: "open",
        per_page: 50,
      });

      // Filter out pull requests (they also show up in the issues endpoint)
      const issues = data.filter((issue: any) => !issue.pull_request);

      return issues.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
        labels: issue.labels
          .map((label: any) => (typeof label === "string" ? label : label.name || ""))
          .filter(Boolean),
        body: issue.body?.slice(0, 200) || "",
        createdAt: issue.created_at,
      }));
    } catch (error: any) {
      console.error("Error fetching issues:", error);
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  },
});
