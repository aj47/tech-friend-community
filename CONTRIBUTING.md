# Contributing to Tech Friend Community

Thanks for helping us **accelerate open source**.

- Start here: **docs/START_HERE.md**
- Product/user flow: **docs/USER_JOURNEY.md**

## Local development (pnpm)

### Prerequisites

- Node.js 18+
- pnpm (recommended: `corepack enable`)
- A Convex account (free tier is fine)
- A GitHub OAuth App (for local auth)

### Setup

1. **Fork & clone**

2. **Install deps**

```bash
pnpm install
```

3. **Configure Convex**

Run the Convex dev server once to create/connect a project and generate env values:

```bash
pnpm dev:convex
```

This typically creates/updates `.env.local` with:

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`

4. **Configure GitHub OAuth**

Create an OAuth app at https://github.com/settings/developers

- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `<your-convex-deployment-url>/api/auth/callback/github`
  - You can find the deployment URL in `.env.local` after running Convex.

Add to `.env.local`:

- `AUTH_GITHUB_ID=...`
- `AUTH_GITHUB_SECRET=...`

5. **Run the app**

```bash
pnpm dev
```

### Common commands

- `pnpm dev` — run Next.js + Convex dev servers
- `pnpm lint` — eslint
- `pnpm build` — production build

## PR etiquette

- Prefer **small, focused PRs** with a clear “why” and “what changed”.
- Link the relevant issue in the PR description.
- Run `pnpm lint` before requesting review.
- Include screenshots for UI changes.
- Don’t commit secrets (never commit `.env.local`).

## Need help?

Open a GitHub issue with:

- what you tried
- what you expected
- what happened (logs/screenshots)

