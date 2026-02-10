# MCAT Prep App - Question Bank

This directory contains pre-generated MCAT-style questions organized by book and chapter.

## Directory Structure

```
questions/
├── README.md
├── schema.json
├── biology/
│   ├── chapter-01.json
│   ├── chapter-02.json
│   └── ...
├── physics-math/
│   ├── chapter-01.json
│   └── ...
├── biochemistry/
│   ├── chapter-01.json
│   └── ...
├── behavioral-sciences/
│   ├── chapter-01.json
│   └── ...
├── general-chemistry/
│   ├── chapter-01.json
│   └── ...
├── organic-chemistry/
│   ├── chapter-01.json
│   └── ...
└── cars/
    ├── chapter-01.json
    └── ...
```

## Book Directory Names

| Directory | Full Book Title |
|-----------|-----------------|
| `biology` | KAPLAN MCAT BIOLOGY REVIEW 2024-2025 |
| `physics-math` | KAPLAN MCAT PHYSICS AND MATH REVIEW 2024-2025 |
| `biochemistry` | MCAT Biochemistry Review 2022-2023 |
| `behavioral-sciences` | MCAT Behavioral Sciences Review 2023-2024 |
| `general-chemistry` | MCAT General Chemistry Review 2024-2025 |
| `organic-chemistry` | MCAT Organic Chemistry Review 2024-2025 |
| `cars` | MCAT Critical Analysis and Reasoning Skills Review |

## Question JSON Schema

Each chapter file contains an array of questions. See `schema.json` for the full JSON schema definition.

### Question Object Structure

```json
{
  "id": "biology-01-001",
  "question_text": "Which of the following best describes...",
  "options": [
    "A. First option",
    "B. Second option",
    "C. Third option",
    "D. Fourth option"
  ],
  "correct_answer": "B",
  "explanation": "The correct answer is B because...",
  "concept_tags": ["cell-membrane", "transport-proteins"],
  "difficulty": "medium"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier: `{book}-{chapter}-{number}` |
| `question_text` | string | Yes | The full question text |
| `options` | array[4] | Yes | Exactly 4 answer choices, prefixed with A-D |
| `correct_answer` | string | Yes | The correct option letter (A, B, C, or D) |
| `explanation` | string | Yes | Detailed explanation of why the answer is correct and why distractors are wrong |
| `concept_tags` | array | Yes | Array of concept identifiers for adaptive learning |
| `difficulty` | string | No | Question difficulty: "easy", "medium", or "hard" |

## Concept Tags

Concept tags enable the adaptive learning system to find related questions when a user answers incorrectly. Tags should be:

- Lowercase with hyphens (e.g., `krebs-cycle`, `action-potential`)
- Specific enough to group related questions
- Consistent across the question bank

## Target: ~50 Questions Per Chapter

Each chapter should have approximately 50 questions covering:
- All major concepts in the chapter
- Multiple questions per key concept (different framings/applications)
- A mix of difficulty levels
