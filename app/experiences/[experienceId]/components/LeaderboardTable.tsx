import { Badge } from "frosted-ui";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="bg-[var(--robinhood-bg)] rounded-lg border border-[var(--robinhood-border)] overflow-hidden">
      <div className="divide-y divide-[var(--robinhood-border)]">
        {leaderboard.map((entry) => {
          const isPositive = entry.percentage_gain >= 0;
          const isCurrentUser = entry.user_id === currentUserId;
          
          return (
            <div 
              key={entry.user_id} 
              className={cn(
                "px-6 py-4 hover:bg-[var(--robinhood-hover)] cursor-pointer",
                isCurrentUser && "bg-[var(--robinhood-hover)] border-l-2 border-[var(--robinhood-green)]"
              )}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Rank and User info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      entry.rank === 1 ? "bg-[var(--robinhood-green)] text-[var(--robinhood-bg)]" :
                      entry.rank === 2 ? "bg-[var(--robinhood-muted)] text-[var(--robinhood-bg)]" :
                      entry.rank === 3 ? "bg-[var(--robinhood-red)] text-[var(--robinhood-text)]" :
                      "bg-[var(--robinhood-card)] text-[var(--robinhood-text)] border border-[var(--robinhood-border)]"
                    )}>
                      {entry.rank}
                    </div>
                    
                    {/* User info */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--robinhood-text)] text-base">
                          {entry.name}
                        </span>
                        {entry.prestige_level > 0 && (
                          <Badge className="bg-[var(--robinhood-green)] text-[var(--robinhood-bg)] text-xs px-2 py-1 rounded-full">
                            P{entry.prestige_level}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[var(--robinhood-muted)] text-sm">
                        @{entry.username}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Performance */}
                <div className="flex flex-col items-end">
                  <div className={cn(
                    "font-bold text-lg",
                    isPositive ? "text-[var(--robinhood-green)]" : "text-[var(--robinhood-red)]"
                  )}>
                    {isPositive ? '+' : ''}{entry.percentage_gain.toFixed(2)}%
                  </div>
                  <div className="text-[var(--robinhood-muted)] text-xs">
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
