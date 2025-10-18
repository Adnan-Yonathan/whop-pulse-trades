import { LeaderboardEntry, Submission, User } from '@/types/database';

export function calculateLeaderboard(
  submissions: (Submission & { user: User })[],
  currentUserId?: string
): LeaderboardEntry[] {
  // Sort by percentage gain (descending), then by submission time (ascending for ties)
  const sorted = submissions.sort((a, b) => {
    if (a.percentage_gain !== b.percentage_gain) {
      return b.percentage_gain - a.percentage_gain;
    }
    return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
  });

  // Calculate ranks (handle ties)
  let currentRank = 1;
  let previousGain: number | null = null;
  let rankAdjustment = 0;

  return sorted.map((submission, index) => {
    if (previousGain !== null && submission.percentage_gain !== previousGain) {
      currentRank = index + 1;
      rankAdjustment = 0;
    } else if (previousGain !== null && submission.percentage_gain === previousGain) {
      rankAdjustment++;
    }
    
    previousGain = submission.percentage_gain;

    return {
      rank: currentRank,
      user_id: submission.user_id,
      username: submission.user.username,
      name: submission.user.name,
      percentage_gain: submission.percentage_gain,
      submitted_at: submission.submitted_at,
      prestige_level: submission.user.prestige_level,
      proof_image_url: submission.proof_image_url,
    };
  });
}

export function getTopThree(leaderboard: LeaderboardEntry[]) {
  return leaderboard.slice(0, 3);
}

export function getUserRank(leaderboard: LeaderboardEntry[], userId: string): LeaderboardEntry | null {
  return leaderboard.find(entry => entry.user_id === userId) || null;
}

export function calculateWeeklyLeaderboard(
  submissions: (Submission & { user: User })[],
  weekStartDate: string
): LeaderboardEntry[] {
  // Filter submissions for the specific week
  const weekSubmissions = submissions.filter(
    sub => sub.week_start_date === weekStartDate
  );

  // Group by user and sum their gains for the week
  const userTotals = new Map<string, {
    user: User;
    totalGain: number;
    submissions: Submission[];
  }>();

  weekSubmissions.forEach(submission => {
    const existing = userTotals.get(submission.user_id);
    if (existing) {
      existing.totalGain += submission.percentage_gain;
      existing.submissions.push(submission);
    } else {
      userTotals.set(submission.user_id, {
        user: submission.user,
        totalGain: submission.percentage_gain,
        submissions: [submission]
      });
    }
  });

  // Convert to leaderboard format and sort
  const weeklyEntries = Array.from(userTotals.values())
    .map(({ user, totalGain, submissions }) => ({
      rank: 0, // Will be calculated
      user_id: user.id,
      username: user.username,
      name: user.name,
      percentage_gain: totalGain,
      submitted_at: submissions[submissions.length - 1].submitted_at, // Last submission time
      prestige_level: user.prestige_level,
      proof_image_url: null, // No single proof image for weekly
    }))
    .sort((a, b) => b.percentage_gain - a.percentage_gain);

  // Calculate ranks
  return weeklyEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
