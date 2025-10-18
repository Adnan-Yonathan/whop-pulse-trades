import { Badge } from "frosted-ui";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <tr 
                key={entry.user_id} 
                className={entry.user_id === currentUserId ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">#{entry.rank}</span>
                    {entry.rank === 1 && entry.prestige_level === 0 && (
                      <span className="text-yellow-500">👑</span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-sm text-gray-600">@{entry.username}</div>
                    </div>
                    {entry.prestige_level > 0 && (
                      <Badge className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white text-xs">
                        {entry.prestige_level}
                      </Badge>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`font-bold ${entry.percentage_gain > 0 ? 'text-green-600' : entry.percentage_gain < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {entry.percentage_gain > 0 ? '+' : ''}{entry.percentage_gain.toFixed(2)}%
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                  {new Date(entry.submitted_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
