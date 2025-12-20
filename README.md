# Tech Friend Community

Tech Friend Community is a community + platform for **accelerating open source** — helping people go from “I want to contribute” to “verified contribution” faster.

Website: https://techfriendcommunity.com

## The loop (user journey)

**Join → Find work → Contribute → Submit → Verify → Recognition → Repeat**

- **Join**: sign in with GitHub
- **Find work**: browse projects + issues
- **Contribute**: do the work on GitHub (PR, issue fix, review, etc.)
- **Submit**: link your GitHub URL in the platform
- **Verify**: the project owner verifies/rejects your submission
- **Recognition**: points + tier (Builder → Contributor → Core → Architect) + leaderboard + rewards
- **Repeat**: keep shipping

Start here:

- [docs/START_HERE.md](docs/START_HERE.md)
- [docs/USER_JOURNEY.md](docs/USER_JOURNEY.md)

## For members (using the platform)

1. Sign in with GitHub: `/auth/signin`
2. Find work:
   - Browse projects: `/projects`
   - Browse issues: `/issues`
3. Do the work on GitHub.
4. Submit a contribution from the project page: `/projects/:id` → “Submit a Contribution”.
5. Track progress + recognition:
   - Profile (points + tier): `/profile`
   - Notifications: `/notifications`
   - Leaderboard: `/leaderboard`
   - Rewards: `/rewards`

If you want to run a project:

- Submit your repo: `/projects/submit`
- Manage it: `/projects/:id/edit`
- Verify contributions: `/projects/:id`

## For developers (running locally)

This repo contains the Tech Friend Community web app (Next.js + Convex).

### Prerequisites

- Node.js 18+
- pnpm (recommended: `corepack enable`)
- A Convex account
- A GitHub OAuth App (for local auth)

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the dev servers:

   ```bash
   pnpm dev
   ```

   (Or separately: `pnpm dev:convex` and `pnpm dev:next`.)

3. Configure GitHub OAuth:

   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `<your-convex-deployment-url>/api/auth/callback/github`

   Add to `.env.local`:

   ```
   AUTH_GITHUB_ID=...
   AUTH_GITHUB_SECRET=...
   ```

### Quality checks

- Lint: `pnpm lint`
- Build: `pnpm build`

### Deploying to Vercel

This repo is designed to deploy to **Vercel** (the recommended platform for Next.js + Convex apps).

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add your environment variables (Convex URL, GitHub OAuth, etc.)
4. Deploy

Vercel will auto-detect the Next.js framework and use `pnpm build` / `pnpm start`.

## Contributing

See **CONTRIBUTING.md**.

## License

MIT
