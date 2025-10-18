export interface User {
  id: string;
  whop_user_id: string;
  username: string;
  name: string;
  prestige_level: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  experience_id: string;
  percentage_gain: number;
  proof_image_url: string | null;
  submission_date: string;
  submitted_at: string;
  week_start_date: string;
}

export interface LeaderboardReset {
  id: string;
  experience_id: string;
  reset_type: 'daily' | 'weekly';
  reset_at: string;
  admin_user_id: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  name: string;
  percentage_gain: number;
  submitted_at: string;
  prestige_level: number;
  proof_image_url: string | null;
}

export interface UserStats {
  total_submissions: number;
  average_gain: number;
  best_day: number;
  current_streak: number;
  prestige_level: number;
}
