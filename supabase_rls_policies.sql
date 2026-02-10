-- Row Level Security (RLS) Policies for MCAT Prep App
-- Run this in the Supabase SQL Editor to secure user progress tables

-- Enable RLS on user_progress table
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Enable RLS on concept_mastery table
ALTER TABLE concept_mastery ENABLE ROW LEVEL SECURITY;

-- Policies for user_progress table
CREATE POLICY "Users can view own progress"
ON user_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policies for concept_mastery table
CREATE POLICY "Users can view own mastery"
ON concept_mastery
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mastery"
ON concept_mastery
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mastery"
ON concept_mastery
FOR UPDATE
USING (auth.uid() = user_id);
