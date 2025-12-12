-- Database initialization script for Global Guess Quiz
-- Run this on your PostgreSQL database (Railway or any other provider)

CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  time_remaining INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on created_at for faster sorting on the leaderboard
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);

-- Create an index on score for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC, time_remaining DESC);
