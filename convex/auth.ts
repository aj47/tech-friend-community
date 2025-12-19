import GitHub from "@auth/core/providers/github";
import type { Doc } from "./_generated/dataModel";
import { convexAuth } from "@convex-dev/auth/server";

const githubProvider = GitHub({
  // Request broader scopes so we can list private repos and interact with issues/PRs
  // Public repos will work without "repo", but we include it for a smoother UX.
  authorization: { params: { scope: "read:user user:email repo" } },
  profile(profile, tokens) {
    const rawId = profile.id ?? profile.node_id;
    if (!rawId) {
      throw new Error("GitHub profile is missing an id");
    }

    const id = String(rawId);

    return {
      id,
      githubId: id,
      githubUsername: profile.login ?? undefined,
      login: profile.login ?? undefined,
      name: profile.name ?? undefined,
      email: profile.email ?? undefined,
      image: profile.avatar_url ?? undefined,
      avatar_url: profile.avatar_url ?? undefined,
      githubAccessToken: tokens?.access_token ?? undefined,
    };
  },
});

type GithubProfileFields = {
  githubId?: string;
  githubUsername?: string;
  login?: string;
  name?: string;
  email?: string;
  image?: string;
  avatar_url?: string;
  githubAccessToken?: string;
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [githubProvider],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      console.log("[convex/auth] afterUserCreatedOrUpdated profile", args.profile);
      if (args.type !== "oauth" || args.provider.id !== githubProvider.id) {
        return;
      }

      const existingUser = await ctx.db.get(args.userId);
      if (!existingUser) {
        return;
      }

      const profile = args.profile as GithubProfileFields;
      const updates: Partial<Doc<"users">> = {};

      const accessToken = profile.githubAccessToken;
      if (accessToken) {
        updates.githubAccessToken = accessToken;
      }

      const githubId = profile.githubId;
      if (githubId && githubId !== existingUser.githubId) {
        updates.githubId = githubId;
      }

      const username = profile.githubUsername ?? profile.login;
      if (username && username !== existingUser.githubUsername) {
        updates.githubUsername = username;
      }

      const name = profile.name ?? username;
      if (name && name !== existingUser.name) {
        updates.name = name;
      }

      const image = profile.image ?? profile.avatar_url;
      if (image && image !== existingUser.image) {
        updates.image = image;
      }

      const email = profile.email;
      if (email && email !== existingUser.email) {
        updates.email = email;
      }

      if (!existingUser.createdAt) {
        updates.createdAt = Date.now();
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(args.userId, updates);
      }
    },
  },
});
