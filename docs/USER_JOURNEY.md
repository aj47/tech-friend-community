# User Journey

**Loop:** Join → Find work → Contribute → Submit → Verify → Recognition → Repeat

Tech Friend Community is designed around this loop so contributors and project owners can move faster, together.

Website: https://techfriendcommunity.com

## Roles vs tiers

- **Roles** are what you’re doing right now:
  - **Contributor**: ships changes to open source projects.
  - **Project owner/maintainer**: curates work and verifies submissions.
  - **Supporter/reviewer**: helps with triage, reviews, and unblocking.
- **Tiers** are your points level: **Builder → Contributor → Core → Architect**.

There’s no in-app “pick a role” step today—your role is just how you choose to participate.

## Contributor flow (shipping work)

1. **Join**
   - Sign in with GitHub: `/auth/signin`
2. **Find work**
   - Browse projects: `/projects`
   - Browse issues: `/issues`
   - Open a project page: `/projects/:id`
3. **Contribute (on GitHub)**
   - Typical contribution types in the platform:
     - **Merged PR**
     - **Issue fixed**
     - **Feedback accepted** (review/triage/helpful discussion)
4. **Submit**
   - Paste the GitHub URL on the project page: `/projects/:id` → “Submit a Contribution”.
5. **Verify**
   - The project owner reviews and marks the submission `verified` or `rejected` (it starts as `pending`).
6. **Recognition**
   - Points are awarded and your tier/leaderboard placement updates.
   - Track it on `/profile` and `/leaderboard` (and via `/notifications`).
7. **Repeat**
   - Pick the next issue, support another contributor, or level up.

## Project owner flow (running a project)

1. **Join**
   - Sign in with GitHub: `/auth/signin`
2. **Submit your repo as a project**
   - Add a project: `/projects/submit`
3. **Curate work**
   - Edit details/tags/help wanted and (optionally) sync/select issues: `/projects/:id/edit`
4. **Verify submissions**
   - Review incoming contributions on the project page and verify/reject: `/projects/:id`
5. **Recognition + community health**
   - Credit wins, keep scope clear, and help contributors succeed.
6. **Repeat**
   - Keep the project contributor-friendly.

## What “Verify” means (practically)

Verification is currently **manual inside the platform**. It’s meant to confirm that a submission maps to real work and is acknowledged by the project owner.

Typical signals:

- URL points to the right repo/work (PR/issue/discussion)
- It’s consistent with the project’s goals (merged PR, issue fixed, accepted feedback)
- The owner confirms it (merge/close/approve/acknowledge)

## Where to go next

- Start here: **docs/START_HERE.md**
- Contributing to this repo: **../CONTRIBUTING.md**

