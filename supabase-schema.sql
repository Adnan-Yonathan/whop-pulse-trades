-- Pulse Trades Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  whop_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  prestige_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  experience_id TEXT NOT NULL,
  percentage_gain DECIMAL(10,2) NOT NULL,
  proof_image_url TEXT,
  submission_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  week_start_date DATE NOT NULL,
  UNIQUE(user_id, experience_id, submission_date)
);

-- Leaderboard resets table
CREATE TABLE leaderboard_resets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  experience_id TEXT NOT NULL,
  reset_type TEXT NOT NULL CHECK (reset_type IN ('daily', 'weekly')),
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_user_id TEXT
);

-- Indexes for better performance
CREATE INDEX idx_submissions_experience_date ON submissions(experience_id, submission_date);
CREATE INDEX idx_submissions_user_experience ON submissions(user_id, experience_id);
CREATE INDEX idx_submissions_week ON submissions(week_start_date);
CREATE INDEX idx_users_whop_id ON users(whop_user_id);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_resets ENABLE ROW LEVEL SECURITY;

-- Users can read all users
CREATE POLICY "Users can read all users" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

-- Users can read all submissions
CREATE POLICY "Users can read all submissions" ON submissions
  FOR SELECT USING (true);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (true);

-- Users can read all leaderboard resets
CREATE POLICY "Users can read leaderboard resets" ON leaderboard_resets
  FOR SELECT USING (true);

-- Storage bucket for proof images
INSERT INTO storage.buckets (id, name, public) VALUES ('proof-images', 'proof-images', false);

-- Storage policies
CREATE POLICY "Users can upload proof images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'proof-images');

CREATE POLICY "Users can view own proof images" ON storage.objects
  FOR SELECT USING (bucket_id = 'proof-images');

CREATE POLICY "Admins can view all proof images" ON storage.objects
  FOR SELECT USING (bucket_id = 'proof-images');
