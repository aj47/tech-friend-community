# Start Here

Tech Friend Community helps people contribute to open source with a clear, repeatable loop: **Join → Find work → Contribute → Submit → Verify → Recognition → Repeat**.

Website: https://techfriendcommunity.com

## Using the platform (members)

1. Sign in with GitHub: `/auth/signin`
2. Find work:
   - Browse projects: `/projects`
   - Browse issues: `/issues`
3. Do the work on GitHub (PR, issue fix, review, etc.).
4. Submit your GitHub URL from the project page: `/projects/:id` → “Submit a Contribution”.
5. Track status + recognition:
   - Profile (points + tier): `/profile`
   - Notifications: `/notifications`
   - Leaderboard: `/leaderboard`
   - Rewards: `/rewards`

If you want to run a project (project owner/maintainer):

- Submit your repo: `/projects/submit`
- Manage it: `/projects/:id/edit`
- Verify/reject contributions on: `/projects/:id`

> Note: “roles” are just what you’re doing (contributing vs running a project). “tiers” are your points level (Builder → Contributor → Core → Architect).

Next: read **docs/USER_JOURNEY.md** for the full end-to-end flow.

### I’m a developer (I want to run this repo locally)

Start with **CONTRIBUTING.md**.

Quick start:

```bash
pnpm install
pnpm dev
```

## Helpful docs

- User journey: **docs/USER_JOURNEY.md**
- Contributing (dev setup + PR etiquette): **../CONTRIBUTING.md**
- Project overview: **../README.md**

