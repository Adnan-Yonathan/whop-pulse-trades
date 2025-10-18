import { Badge } from "frosted-ui";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface TopThreeProps {
  topThree: LeaderboardEntry[];
}

export function TopThree({ topThree }: TopThreeProps) {
  const podiumColors = [
    'bg-gradient-to-b from-yellow-400 to-yellow-600', // Gold
    'bg-gradient-to-b from-gray-300 to-gray-500', // Silver
    'bg-gradient-to-b from-orange-400 to-orange-600', // Bronze
  ];

  const podiumHeights = ['h-32', 'h-24', 'h-16'];
  const medalEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex justify-center items-end space-x-4 mb-8">
      {topThree.map((entry, index) => (
        <div key={entry.user_id} className="text-center">
          <div className={`${podiumColors[index]} ${podiumHeights[index]} w-24 rounded-t-lg flex flex-col items-center justify-end p-4 shadow-lg`}>
            <div className="text-4xl mb-2">{medalEmojis[index]}</div>
            <div className="text-white font-bold text-sm text-center">
              <div className="truncate">{entry.name}</div>
              <div className="text-xs opacity-90">@{entry.username}</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-foreground">
              {entry.percentage_gain > 0 ? '+' : ''}{entry.percentage_gain.toFixed(2)}%
            </div>
            {entry.prestige_level > 0 && (
              <Badge className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white text-xs mt-1">
                Prestige {entry.prestige_level}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
