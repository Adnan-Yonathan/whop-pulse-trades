"use client";

import { useState, useEffect } from "react";
import { Button, Tabs } from "frosted-ui";
import { TopThree } from "./TopThree";
import { LeaderboardTable } from "./LeaderboardTable";
import { PersonalCard } from "./PersonalCard";
import { SubmissionModal } from "./SubmissionModal";
import { getTimeUntilMidnightET } from "@/lib/utils/timezone";
import type { LeaderboardEntry } from "@/types/database";

interface PulseTradesLeaderboardProps {
  experienceId: string;
  currentUserId: string;
  isAdmin: boolean;
}

export function PulseTradesLeaderboard({ experienceId, currentUserId, isAdmin }: PulseTradesLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  const fetchLeaderboard = async (type: 'daily' | 'weekly' = 'daily') => {
    try {
      const response = await fetch(`/api/leaderboard?experienceId=${experienceId}&type=${type}`);
      const data = await response.json();

      if (response.ok) {
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || null);
        setHasSubmittedToday(!!data.userRank);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubmissionStatus = async () => {
    try {
      const response = await fetch(`/api/submissions?experienceId=${experienceId}`);
      const data = await response.json();
      
      if (response.ok) {
        const today = new Date().toISOString().split('T')[0];
        const todaySubmission = data.submissions?.find((sub: any) => sub.submission_date === today);
        setHasSubmittedToday(!!todaySubmission);
      }
    } catch (error) {
      console.error('Failed to check submission status:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    checkSubmissionStatus();
  }, [experienceId]);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, experienceId]);

  useEffect(() => {
    // Update countdown timer every second
    const updateTimer = () => {
      setTimeUntilReset(getTimeUntilMidnightET());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmissionSuccess = () => {
    fetchLeaderboard(activeTab);
    checkSubmissionStatus();
  };

  const topThree = leaderboard.slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-6">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with submission button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-9">
            {activeTab === 'daily' ? 'Daily' : 'Weekly'} Leaderboard
          </h2>
          <p className="text-gray-6">
            {activeTab === 'daily' 
              ? 'Rankings based on today\'s trading performance'
              : 'Rankings based on this week\'s cumulative performance'
            }
          </p>
        </div>
        
        <Button 
          onClick={() => setIsSubmissionModalOpen(true)}
          disabled={hasSubmittedToday && activeTab === 'daily'}
          className={hasSubmittedToday ? 'opacity-50' : ''}
        >
          {hasSubmittedToday && activeTab === 'daily' ? 'Already Submitted Today' : 'Submit P&L'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'daily' | 'weekly')}>
        <Tabs.List>
          <Tabs.Trigger value="daily">Daily</Tabs.Trigger>
          <Tabs.Trigger value="weekly">Weekly</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-9 mb-4">Top Performers</h3>
          <TopThree topThree={topThree} />
        </div>
      )}

      {/* Full Leaderboard */}
      <div>
        <h3 className="text-xl font-semibold text-gray-9 mb-4">
          Full Rankings ({leaderboard.length} participants)
        </h3>
        
        {leaderboard.length > 0 ? (
          <LeaderboardTable leaderboard={leaderboard} currentUserId={currentUserId} />
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-gray-6">
              {activeTab === 'daily' 
                ? 'No submissions yet today. Be the first to submit your P&L!'
                : 'No submissions yet this week. Start submitting your daily P&L to appear here!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSuccess={handleSubmissionSuccess}
        experienceId={experienceId}
      />

      {/* Personal Card */}
      <PersonalCard
        userRank={userRank}
        timeUntilReset={timeUntilReset}
        hasSubmittedToday={hasSubmittedToday}
      />
    </div>
  );
}
