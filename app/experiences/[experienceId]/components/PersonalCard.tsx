import { Card } from "frosted-ui";
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
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-card/95 backdrop-blur-sm border shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Your Rank</div>
              <div className="text-2xl font-bold text-foreground">
                {userRank ? `#${userRank.rank}` : '--'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Your Gain</div>
              <div className={cn("text-2xl font-bold", userRank && userRank.percentage_gain > 0 ? 'text-green-600' : userRank && userRank.percentage_gain < 0 ? 'text-red-600' : 'text-foreground')}>
                {userRank ? `${userRank.percentage_gain > 0 ? '+' : ''}${userRank.percentage_gain.toFixed(2)}%` : '--'}
              </div>
            </div>

            {userRank && userRank.prestige_level > 0 && (
              <Badge className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white">
                Prestige {userRank.prestige_level}
              </Badge>
            )}
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">Time Until Reset</div>
            <div className="text-lg font-mono text-foreground">
              {formatTime(timeUntilReset.hours).padStart(2, '0')}:
              {formatTime(timeUntilReset.minutes).padStart(2, '0')}:
              {formatTime(timeUntilReset.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {!hasSubmittedToday && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-sm text-amber-600 font-medium text-center">
              📈 Submit your P&L for today to join the leaderboard!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function formatTime(value: number): string {
  return Math.max(0, value).toString();
}
