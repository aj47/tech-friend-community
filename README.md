# Agent Battler 🤖⚔️

A platform where developers can post GitHub issues with bounties and contributors can submit pull requests using their favorite AI coding agents. Track which AI agents win the most bounties!

https://agent-battler.vercel.app/

<img width="2316" height="2208" alt="Image" src="https://github.com/user-attachments/assets/0414f9fd-c86f-4d75-85c2-5451068eef0c" />

## Features

- **GitHub OAuth Authentication**: Seamless sign-in with GitHub
- **Issue Management**: Post GitHub issues with bounty rewards
- **PR Submissions**: Submit PRs and specify which AI coding agent you used
- **Terminal Session Recordings**: Share asciicinema recordings of your agent working on issues
- **Bounty System**: Earn points for approved PRs
- **Agent Leaderboard**: Track which AI coding agents are most successful
- **Real-time Updates**: Built with Convex for real-time data synchronization

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless backend with real-time database)
- **Authentication**: Convex Auth with GitHub OAuth
- **API Integration**: GitHub API via Octokit
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A GitHub account
- A Convex account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AgentBattler2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project
   - Generate environment variables in `.env.local`
   - Start the Convex development server

4. **Configure GitHub OAuth**

   a. Go to [GitHub Developer Settings](https://github.com/settings/developers)

   b. Click "New OAuth App"

   c. Fill in the details:
      - **Application name**: Agent Battler (or your preferred name)
      - **Homepage URL**: `http://localhost:3000`
      - **Authorization callback URL**: `https://your-deployment.convex.site/api/auth/callback/github`
        (Replace `your-deployment` with your actual Convex deployment URL from `.env.local`)

   d. Copy the Client ID and generate a Client Secret

   e. Add them to your `.env.local`:
      ```
      AUTH_GITHUB_ID=your_github_client_id
      AUTH_GITHUB_SECRET=your_github_client_secret
      ```

5. **Seed the database with coding agents**

   Open the Convex dashboard and run:
   ```bash
   npx convex run codingAgents:seedCodingAgents
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── issues/            # Issue-related pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Navbar.tsx         # Navigation component
│   ├── IssueCard.tsx      # Issue display card
│   └── Button.tsx         # Reusable button component
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Authentication config
│   ├── github.ts          # GitHub API integration
│   ├── users.ts           # User management
│   ├── issues.ts          # Issue management
│   ├── pullRequests.ts    # PR management
│   ├── codingAgents.ts    # Coding agent management
│   └── notifications.ts   # Notification system
└── public/                # Static assets
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

## Usage

### For Issue Creators

1. Sign in with GitHub
2. Click "Post Issue"
3. Select a repository and issue
4. Set a bounty amount
5. Post to the platform

### For Contributors

1. Sign in with GitHub
2. Browse available issues
3. Work on a solution using your favorite AI coding agent
4. (Optional) Record your terminal session with [asciinema](https://asciinema.org)
5. Submit a PR on GitHub
6. Link your PR on the platform and specify which agent you used
7. (Optional) Share your terminal recording to show your workflow
8. Wait for approval to earn the bounty

**📹 Recording Your Session:**
See [ASCIICINEMA_GUIDE.md](ASCIICINEMA_GUIDE.md) for a complete guide on recording terminal sessions.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Convex to Production

```bash
npx convex deploy
```

Update your GitHub OAuth callback URL to use your production Convex URL.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.
