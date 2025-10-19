import { Badge } from "frosted-ui";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="bg-robinhood-bg rounded-lg border border-robinhood-border overflow-hidden">
      <div className="divide-y divide-robinhood-border">
        {leaderboard.map((entry) => {
          const isPositive = entry.percentage_gain >= 0;
          const isCurrentUser = entry.user_id === currentUserId;
          
          return (
            <div 
              key={entry.user_id} 
              className={cn(
                "px-6 py-4 hover:bg-robinhood-hover cursor-pointer transition-colors",
                isCurrentUser && "bg-robinhood-hover border-l-2 border-robinhood-green"
              )}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Rank and User info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      entry.rank === 1 ? "bg-robinhood-green text-robinhood-bg" :
                      entry.rank === 2 ? "bg-robinhood-muted text-robinhood-bg" :
                      entry.rank === 3 ? "bg-robinhood-red text-robinhood-text" :
                      "bg-robinhood-card text-robinhood-text border border-robinhood-border"
                    )}>
                      {entry.rank}
                    </div>
                    
                    {/* User info */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-robinhood-text text-base">
                          {entry.name}
                        </span>
                        {entry.prestige_level > 0 && (
                          <Badge className="bg-robinhood-green text-robinhood-bg text-xs px-2 py-1 rounded-full">
                            P{entry.prestige_level}
                          </Badge>
                        )}
                      </div>
                      <span className="text-robinhood-muted text-sm">
                        @{entry.username}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Performance */}
                <div className="flex flex-col items-end">
                  <div className={cn(
                    "font-bold text-lg",
                    isPositive ? "text-robinhood-green" : "text-robinhood-red"
                  )}>
                    {isPositive ? '+' : ''}{entry.percentage_gain.toFixed(2)}%
                  </div>
                  <div className="text-robinhood-muted text-xs">
                    Today
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
