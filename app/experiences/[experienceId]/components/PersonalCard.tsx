import { Badge } from "frosted-ui";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface PersonalCardProps {
  userRank: LeaderboardEntry | null;
  timeUntilReset: { hours: number; minutes: number; seconds: number };
  hasSubmittedToday: boolean;
}

export function PersonalCard({ userRank, timeUntilReset, hasSubmittedToday }: PersonalCardProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-robinhood-bg border-t border-robinhood-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Rank and Gain */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="text-robinhood-muted text-sm">Your Rank</div>
              <div className="text-robinhood-text font-bold text-lg">
                {userRank ? `#${userRank.rank}` : '--'}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-robinhood-muted text-sm">Your Gain</div>
              <div className={cn(
                "font-bold text-lg",
                userRank && userRank.percentage_gain > 0 ? 'text-robinhood-green' : 
                userRank && userRank.percentage_gain < 0 ? 'text-robinhood-red' : 
                'text-robinhood-text'
              )}>
                {userRank ? `${userRank.percentage_gain > 0 ? '+' : ''}${userRank.percentage_gain.toFixed(2)}%` : '--'}
              </div>
            </div>

            {userRank && userRank.prestige_level > 0 && (
              <Badge className="bg-robinhood-green text-robinhood-bg text-xs px-2 py-1 rounded-full">
                Prestige {userRank.prestige_level}
              </Badge>
            )}
          </div>

          {/* Right side - Timer */}
          <div className="flex items-center gap-3">
            <div className="text-robinhood-muted text-sm">Reset in</div>
            <div className="text-robinhood-text font-mono text-lg font-medium">
              {formatTime(timeUntilReset.hours).padStart(2, '0')}:
              {formatTime(timeUntilReset.minutes).padStart(2, '0')}:
              {formatTime(timeUntilReset.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {!hasSubmittedToday && (
          <div className="mt-3 pt-3 border-t border-robinhood-border">
            <div className="text-robinhood-green text-sm font-medium text-center">
              📈 Submit your P&L for today to join the leaderboard!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(value: number): string {
  return Math.max(0, value).toString();
}
