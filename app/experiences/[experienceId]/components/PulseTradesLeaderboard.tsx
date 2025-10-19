"use client";

import { useState, useEffect } from "react";
import { Button } from "frosted-ui";
import { cn } from "@/lib/utils";
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
        <div className="text-robinhood-muted">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with submission button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-robinhood-text">
            {activeTab === 'daily' ? 'Daily' : 'Weekly'} Leaderboard
          </h2>
          <p className="text-robinhood-muted">
            {activeTab === 'daily' 
              ? 'Rankings based on today\'s trading performance'
              : 'Rankings based on this week\'s cumulative performance'
            }
          </p>
        </div>
        
        <Button 
          onClick={() => setIsSubmissionModalOpen(true)}
          disabled={hasSubmittedToday && activeTab === 'daily'}
          className={cn(
            hasSubmittedToday && 'opacity-50',
            "bg-robinhood-green hover:bg-robinhood-green/80 text-robinhood-bg"
          )}
        >
          {hasSubmittedToday && activeTab === 'daily' ? 'Already Submitted Today' : 'Submit P&L'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex bg-robinhood-card p-1 rounded-lg border border-robinhood-border">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'daily'
                ? 'bg-robinhood-green text-robinhood-bg'
                : 'text-robinhood-muted hover:text-robinhood-text'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'weekly'
                ? 'bg-robinhood-green text-robinhood-bg'
                : 'text-robinhood-muted hover:text-robinhood-text'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-robinhood-text mb-4">Top Performers</h3>
          <TopThree topThree={topThree} />
        </div>
      )}

      {/* Full Leaderboard */}
      <div>
        <h3 className="text-xl font-semibold text-robinhood-text mb-4">
          Full Rankings ({leaderboard.length} participants)
        </h3>
        
        {leaderboard.length > 0 ? (
          <LeaderboardTable leaderboard={leaderboard} currentUserId={currentUserId} />
        ) : (
          <div className="bg-robinhood-card rounded-lg border border-robinhood-border p-8 text-center">
            <p className="text-robinhood-muted">
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
