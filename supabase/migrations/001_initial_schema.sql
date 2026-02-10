-- MCAT Prep App Database Schema
-- Run this in Supabase SQL Editor

-- ===========================================
-- DROP EXISTING TABLES (clean slate)
-- ===========================================
DROP TABLE IF EXISTS concept_mastery CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS books CASCADE;

-- ===========================================
-- BOOKS TABLE
-- ===========================================
CREATE TABLE books (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CHAPTERS TABLE
-- ===========================================
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, chapter_number)
);

CREATE INDEX idx_chapters_book_id ON chapters(book_id);

-- ===========================================
-- QUESTIONS TABLE
-- ===========================================
CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    concept_tags TEXT[] DEFAULT '{}',
    difficulty TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX idx_questions_concept_tags ON questions USING GIN(concept_tags);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- ===========================================
-- USER PROGRESS TABLE
-- ===========================================
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answered_correctly BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_question_id ON user_progress(question_id);

-- ===========================================
-- CONCEPT MASTERY TABLE
-- ===========================================
CREATE TABLE concept_mastery (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    concept_tag TEXT NOT NULL,
    mastery_level INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_practiced TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, concept_tag)
);

CREATE INDEX idx_concept_mastery_user_id ON concept_mastery(user_id);
CREATE INDEX idx_concept_mastery_concept_tag ON concept_mastery(concept_tag);
