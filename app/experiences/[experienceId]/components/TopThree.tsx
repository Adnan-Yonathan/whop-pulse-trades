import { Badge } from "frosted-ui";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface TopThreeProps {
  topThree: LeaderboardEntry[];
}

export function TopThree({ topThree }: TopThreeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {topThree.map((entry, index) => {
        const isPositive = entry.percentage_gain >= 0;
        const rankColors = [
          "bg-robinhood-green text-robinhood-bg", // 1st place
          "bg-robinhood-muted text-robinhood-bg", // 2nd place
          "bg-robinhood-red text-robinhood-text", // 3rd place
        ];
        
        return (
          <div key={entry.user_id} className="bg-robinhood-card rounded-lg border border-robinhood-border p-6 hover:bg-robinhood-hover transition-colors">
            <div className="flex flex-col items-center text-center">
              {/* Rank number */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-4",
                rankColors[index]
              )}>
                {index + 1}
              </div>
              
              {/* User info */}
              <div className="mb-3">
                <div className="font-medium text-robinhood-text text-lg mb-1">
                  {entry.name}
                </div>
                <div className="text-robinhood-muted text-sm">
                  @{entry.username}
                </div>
              </div>
              
              {/* Performance */}
              <div className={cn(
                "font-bold text-xl mb-2",
                isPositive ? "text-robinhood-green" : "text-robinhood-red"
              )}>
                {isPositive ? '+' : ''}{entry.percentage_gain.toFixed(2)}%
              </div>
              
              {/* Prestige badge */}
              {entry.prestige_level > 0 && (
                <Badge className="bg-robinhood-green text-robinhood-bg text-xs px-3 py-1 rounded-full">
                  Prestige {entry.prestige_level}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
