# Pulse Trades

A trading community gamification system built for the Whop ecosystem. Features daily leaderboards, prestige badges, proof verification, and admin controls.

## Features

- **Daily Leaderboards**: Rank members by percentage gain (1% = 1 point)
- **Prestige System**: Platinum badges for daily winners that stay forever
- **Proof Verification**: Members can submit proof images (admin-only viewing)
- **Admin Dashboard**: Community stats, manual resets, CSV exports
- **Automatic Resets**: Daily resets at midnight ET with prestige awards
- **Weekly Tracking**: Cumulative weekly leaderboards
- **Webhook Integration**: Auto-sync Whop members to database

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Frosted UI (Whop's design system)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for proof images
- **Authentication**: Whop SDK
- **Deployment**: Vercel with cron jobs

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema from `supabase-schema.sql`
3. Create a storage bucket called `proof-images` (should be created automatically by the schema)

### 2. Environment Variables

Copy `env.example` to `.env.local` and fill in your credentials:

\`\`\`bash
cp env.example .env.local
\`\`\`

Required variables:
- **Whop Configuration**: Get these from your Whop Developer Dashboard
- **Supabase Configuration**: Get these from your Supabase project settings
- **CRON_SECRET**: Generate a secure random string for cron job authentication

### 3. Whop App Configuration

1. Create a Whop app in your [Developer Dashboard](https://whop.com/dashboard/developer/)
2. Set the following paths in your app settings:
   - **App path**: `/experiences/[experienceId]`
   - **Dashboard path**: `/dashboard/[companyId]`
   - **Discover path**: `/discover`
3. Configure webhook endpoints to point to your deployed app's `/api/webhooks` route

### 4. Installation

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
\`\`\`

### 5. Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables to Vercel
4. Deploy

The cron job will automatically run daily at 5 AM UTC (midnight ET) to reset leaderboards and award prestige.

## How It Works

1. **Member Access**: Whop SDK validates membership and syncs users to Supabase
2. **Daily Submissions**: Members submit their P&L percentage once per day
3. **Leaderboard Ranking**: Real-time rankings based on percentage gain
4. **Prestige Awards**: Daily winners receive platinum badges at reset time
5. **Admin Management**: Admins can verify proofs, reset leaderboards, export data

## Database Schema

- **users**: Whop user data with prestige levels
- **submissions**: Daily P&L submissions with proof images
- **leaderboard_resets**: Audit log of resets (manual and automatic)

## API Endpoints

- `POST /api/submissions` - Submit daily P&L
- `GET /api/leaderboard` - Fetch leaderboard data
- `GET /api/admin/stats` - Community statistics
- `POST /api/admin/reset` - Manual leaderboard reset
- `GET /api/admin/export` - Export CSV data
- `GET /api/cron/daily-reset` - Automated daily reset

## Customization

- Modify reset times by changing the cron schedule in `vercel.json`
- Adjust timezone handling in `lib/utils/timezone.ts`
- Customize UI themes by modifying Frosted UI components
- Add additional leaderboard types or scoring systems

## Support

For issues or questions:
- Check the [Whop Documentation](https://dev.whop.com)
- Review Supabase documentation for database queries
- Ensure all environment variables are properly configured
