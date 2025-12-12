-- Add difficulty column to scores table
-- Run this migration after 001_create_scores_table.sql

ALTER TABLE public.scores
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'average';

-- Update existing records to have 'average' difficulty
UPDATE public.scores
SET difficulty = 'average'
WHERE difficulty IS NULL;

-- Create index for difficulty-based queries
CREATE INDEX IF NOT EXISTS scores_difficulty_idx ON public.scores(difficulty);
