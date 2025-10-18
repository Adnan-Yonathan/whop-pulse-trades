"use client";

import { useState, useEffect } from "react";
import { Button, Card, Badge } from "frosted-ui";
import { supabase } from "@/lib/supabase";

interface AdminDashboardProps {
  companyId: string;
}

interface CommunityStats {
  daily: {
    submissions: number;
    averageGain: number;
    bestGain: number;
    bestUser: { username: string; name: string } | null;
    worstGain: number;
    worstUser: { username: string; name: string } | null;
  };
  weekly: {
    submissions: number;
    averageGain: number;
  };
  totalMembers: number;
  date: string;
  weekStart: string;
}

interface Submission {
  id: string;
  percentage_gain: number;
  proof_image_url: string | null;
  submitted_at: string;
  user: {
    username: string;
    name: string;
  };
}

export function AdminDashboard({ companyId }: AdminDashboardProps) {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?experienceId=${companyId}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/admin/submissions?experienceId=${companyId}`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchSubmissions()]);
      setLoading(false);
    };

    loadData();
  }, [companyId]);

  const handleReset = async (resetType: 'daily' | 'weekly') => {
    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienceId: companyId, resetType }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh data
        await Promise.all([fetchStats(), fetchSubmissions()]);
        setShowResetDialog(false);
        alert(`${resetType} leaderboard reset successfully!`);
      } else {
        alert(`Failed to reset: ${data.error}`);
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Failed to reset leaderboard');
    }
  };

  const handleExport = async (type: 'daily' | 'weekly') => {
    try {
      const response = await fetch(`/api/admin/export?experienceId=${companyId}&type=${type}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pulse-trades-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  const getImageUrl = async (imagePath: string) => {
    const { data } = await supabase.storage
      .from('proof-images')
      .createSignedUrl(imagePath, 60); // 60 seconds expiry
    
    return data?.signedUrl || null;
  };

  const handleImageClick = async (imagePath: string) => {
    const url = await getImageUrl(imagePath);
    if (url) {
      setSelectedImage(url);
      setShowImageDialog(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-6">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-6">Daily Submissions</div>
            <div className="text-2xl font-bold text-gray-9">{stats.daily.submissions}</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-6">Daily Average</div>
            <div className={`text-2xl font-bold ${stats.daily.averageGain > 0 ? 'text-green-6' : 'text-red-6'}`}>
              {stats.daily.averageGain > 0 ? '+' : ''}{stats.daily.averageGain}%
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-6">Total Members</div>
            <div className="text-2xl font-bold text-gray-9">{stats.totalMembers}</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-6">Best Performer</div>
            <div className="text-lg font-bold text-green-6">
              {stats.daily.bestGain > 0 ? '+' : ''}{stats.daily.bestGain}%
            </div>
            <div className="text-sm text-gray-6">
              {stats.daily.bestUser ? `@${stats.daily.bestUser.username}` : 'N/A'}
            </div>
          </Card>
        </div>
      )}

      {/* Admin Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-9 mb-4">Admin Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setShowResetDialog(true)} variant="solid" className="bg-red-600 hover:bg-red-700 text-white">
            Reset Leaderboard
          </Button>
          <Button onClick={() => handleExport('daily')} variant="soft">
            Export Daily CSV
          </Button>
          <Button onClick={() => handleExport('weekly')} variant="soft">
            Export Weekly CSV
          </Button>
        </div>
      </Card>

      {/* Today's Submissions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-9 mb-4">
          Today's Submissions ({submissions.length})
        </h3>
        
        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{submission.user.name}</div>
                        <div className="text-sm text-gray-600">@{submission.user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-bold ${submission.percentage_gain > 0 ? 'text-green-600' : submission.percentage_gain < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {submission.percentage_gain > 0 ? '+' : ''}{submission.percentage_gain.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                      {new Date(submission.submitted_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {submission.proof_image_url ? (
                        <Button
                          size="2"
                          variant="soft"
                          onClick={() => handleImageClick(submission.proof_image_url!)}
                        >
                          View Proof
                        </Button>
                      ) : (
                        <span className="text-gray-500 text-sm">No proof</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-6">
            No submissions yet today
          </div>
        )}
      </Card>

      {/* Reset Modal */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Reset Leaderboard</h3>
            <p className="text-gray-600 mb-4">
              This will reset the leaderboard and award prestige to yesterday's winner. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="soft" onClick={() => setShowResetDialog(false)}>
                Cancel
              </Button>
              <Button variant="solid" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleReset('daily')}>
                Reset Daily Leaderboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Proof Image</h3>
              <Button variant="soft" onClick={() => setShowImageDialog(false)}>
                Close
              </Button>
            </div>
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Proof image" 
                className="max-w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
