# Supabase Setup

This directory contains the database schema for the MCAT Prep App.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Settings > API

### 2. Run the Schema Migration

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `migrations/001_initial_schema.sql`
3. Run the SQL to create all tables, indexes, and functions

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

For the frontend, create `frontend/.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Schema Overview

### Tables

| Table | Description |
|-------|-------------|
| `books` | MCAT review books (7 total) |
| `chapters` | Book chapters with titles |
| `questions` | Pre-generated questions with concept tags |
| `user_progress` | Tracks user answers (future) |
| `concept_mastery` | Tracks mastery per concept (future) |

### Key Features

- **Concept Tags**: Questions are tagged with concepts (e.g., `krebs-cycle`, `oxidative-phosphorylation`) stored as PostgreSQL arrays
- **GIN Index**: Fast lookups for questions by concept tag
- **Helper Functions**:
  - `get_questions_by_concept(tag, exclude_ids)` - For adaptive learning
  - `get_chapter_quiz(chapter_id, limit)` - Random quiz generation

### Question Structure

```sql
questions (
    id TEXT PRIMARY KEY,           -- 'biology-01-001'
    chapter_id INTEGER,
    question_text TEXT,
    options JSONB,                 -- ["A. ...", "B. ...", "C. ...", "D. ..."]
    correct_answer TEXT,           -- 'A', 'B', 'C', or 'D'
    explanation TEXT,
    concept_tags TEXT[],           -- ['krebs-cycle', 'atp-synthesis']
    difficulty TEXT                -- 'easy', 'medium', 'hard'
)
```

## Seeding Data

After setting up the schema, seed the database with:

```bash
poetry run python -m mcat_prep_app.seed_database
```

This reads questions from `questions/` JSON files and syncs them to Supabase.
