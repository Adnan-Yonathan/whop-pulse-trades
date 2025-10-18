import { Table, Badge } from "frosted-ui";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Rank</Table.Head>
            <Table.Head>Username</Table.Head>
            <Table.Head className="text-right">Gain</Table.Head>
            <Table.Head className="text-right">Submitted</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {leaderboard.map((entry) => (
            <Table.Row 
              key={entry.user_id} 
              className={entry.user_id === currentUserId ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Table.Cell className="font-medium">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">#{entry.rank}</span>
                  {entry.rank === 1 && entry.prestige_level === 0 && (
                    <span className="text-yellow-500">👑</span>
                  )}
                </div>
              </Table.Cell>
              
              <Table.Cell>
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-sm text-gray-6">@{entry.username}</div>
                  </div>
                  {entry.prestige_level > 0 && (
                    <Badge className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white text-xs">
                      {entry.prestige_level}
                    </Badge>
                  )}
                </div>
              </Table.Cell>
              
              <Table.Cell className="text-right">
                <span className={`font-bold ${entry.percentage_gain > 0 ? 'text-green-6' : entry.percentage_gain < 0 ? 'text-red-6' : 'text-gray-9'}`}>
                  {entry.percentage_gain > 0 ? '+' : ''}{entry.percentage_gain.toFixed(2)}%
                </span>
              </Table.Cell>
              
              <Table.Cell className="text-right text-sm text-gray-6">
                {new Date(entry.submitted_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
