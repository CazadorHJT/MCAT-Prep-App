-- MCAT Prep App - Optional Views and Functions
-- Run this AFTER 001_initial_schema.sql has been applied successfully

-- ===========================================
-- VIEW: Questions with book/chapter context
-- ===========================================
CREATE OR REPLACE VIEW questions_with_context AS
SELECT
    q.id,
    q.question_text,
    q.options,
    q.correct_answer,
    q.explanation,
    q.concept_tags,
    q.difficulty,
    c.chapter_number,
    c.title AS chapter_title,
    b.id AS book_id,
    b.name AS book_name
FROM questions q
JOIN chapters c ON q.chapter_id = c.id
JOIN books b ON c.book_id = b.id;

-- ===========================================
-- FUNCTION: Get questions by concept tag
-- Used for adaptive learning when user gets a question wrong
-- ===========================================
CREATE OR REPLACE FUNCTION get_questions_by_concept(
    p_concept_tag TEXT,
    p_exclude_ids TEXT[] DEFAULT '{}'
)
RETURNS SETOF questions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM questions
    WHERE p_concept_tag = ANY(concept_tags)
    AND id != ALL(p_exclude_ids)
    ORDER BY RANDOM();
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- FUNCTION: Get random quiz for a chapter
-- ===========================================
CREATE OR REPLACE FUNCTION get_chapter_quiz(
    p_chapter_id INTEGER,
    p_limit INTEGER DEFAULT 20
)
RETURNS SETOF questions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM questions
    WHERE chapter_id = p_chapter_id
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
