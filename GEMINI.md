# Gemini Code Companion: MCAT Prep App

This document provides a comprehensive overview of the MCAT Prep App project, designed to be used as a context for AI-driven development.

## Project Overview

The MCAT Prep App is a full-stack web application designed to help users study for the MCAT using their own EPUB review books. The application's core philosophy is to facilitate mastery through active recall and error-driven reinforcement.

The project is structured as a monorepo with two main parts:
*   **Backend:** A Python-based API built with **FastAPI** and **Supabase**. It is responsible for parsing the EPUB book files, managing the pre-generated question bank, and serving content (books, chapters, questions) to the frontend.
*   **Frontend:** A modern web application built with **React** (using Vite). It provides the user interface for browsing content, taking quizzes, and tracking progress, incorporating adaptive learning features. Connects directly to Supabase for data fetching.

### Key Features:
*   **EPUB Content Ingestion:** Parses EPUB files to extract chapters and content.
*   **Database:** Uses **Supabase** (PostgreSQL) to store information about books, chapters, questions, and user progress.
*   **Pre-Generated Question Bank:** A comprehensive bank of **3,790 MCAT-style multiple-choice questions** across 75 chapters from 7 review books. Questions are stored in:
    *   Supabase database (primary storage for the live app)
    *   Local JSON files in `questions/` directory (version-controlled backup)
    *   GitHub (via committed JSON files)

    **Question Bank Coverage:**
    | Book | Chapters | Questions |
    |------|----------|-----------|
    | Biology | 12 | 600 |
    | Physics & Math | 12 | 630 |
    | Biochemistry | 10 | 500 |
    | Behavioral Sciences | 12 | 600 |
    | General Chemistry | 10 | 510 |
    | Organic Chemistry | 10 | 500 |
    | CARS | 9 | 450 |
*   **Adaptive Learning:** Implements an error-driven reinforcement algorithm. When a user answers incorrectly, a *different* pre-generated question on the same concept (identified by concept tags) is selected and re-inserted into the quiz.
*   **RESTful API:** Provides endpoints for the frontend to retrieve all necessary data.
*   **Interactive Quiz Interface:** Allows users to select answers, receive immediate feedback (correct/incorrect highlighting), and view explanations.

---

## Building and Running

### 1. Backend (FastAPI + Supabase)

The backend is managed using **Poetry**.

**Setup (run once):**
```bash
# Install backend dependencies
poetry install
```

**Environment Variables:**
Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

**Database Seeding (run once or to reset):**
This script parses the EPUBs in `Review Book Files/` and syncs the pre-generated questions from `questions/` to Supabase.
```bash
poetry run python -m mcat_prep_app.seed_database
```

**Question Generation (development only):**
To generate new questions for a chapter (requires LLM API key):
```bash
poetry run python -m mcat_prep_app.question_generator --book "Book Name" --chapter 1
```

**Running the Backend Server:**
```bash
# This will start the server on http://127.0.0.1:8000
poetry run uvicorn mcat_prep_app.main:app --reload
```

---

### 2. Frontend (React)

The frontend is managed using **npm**.

**Setup (run once):**
```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend/` directory:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Running the Frontend Development Server:**
```bash
# Navigate to the frontend directory if you are not already there
cd frontend

# This will start the dev server, typically on http://localhost:5173
npm run dev
```

**Note:** The frontend connects directly to Supabase for data fetching. The backend server is only needed for administrative tasks (seeding, question generation).

---

## Development Conventions

### Backend
*   **Framework:** FastAPI is used for building the API, which provides automatic interactive documentation (via Swagger UI at `/docs` when the server is running).
*   **Database:** Supabase (PostgreSQL) is used for cloud-hosted data storage. The Python client (`supabase-py`) handles database interactions.
*   **Dependencies:** Python package dependencies are managed by Poetry.
*   **Structure:**
    *   `mcat_prep_app/main.py`: The main API file containing endpoint definitions.
    *   `mcat_prep_app/supabase_client.py`: Configures the Supabase connection.
    *   `mcat_prep_app/epub_parser.py`: Contains the logic for parsing EPUB files and extracting chapter content.
    *   `mcat_prep_app/question_generator.py`: LLM-based question generation (used during development only). Generates ~50 questions per chapter with concept tags.
    *   `mcat_prep_app/seed_database.py`: Syncs books, chapters, and questions from local JSON files to Supabase.
*   **Question Storage:**
    *   `questions/`: Directory containing pre-generated questions as JSON files, organized by book and chapter.
    *   Each question includes: `question_text`, `correct_answer`, `options` (array of 4), `explanation`, and `concept_tags` (array).

### Frontend
*   **Framework:** React with Vite provides a fast development environment.
*   **Data Fetching:** The Supabase JavaScript client is used for direct database access. The service is centralized in `frontend/src/services/supabase.js`.
*   **Dependencies:** Frontend packages are managed by npm.
*   **Structure:**
    *   `frontend/src/App.jsx`: The main application component, managing the overall navigation flow from books to chapters to quizzes, and handling state for selected book and chapter.
    *   `frontend/src/components/ChapterList.jsx`: Displays a list of chapters for a selected book, allowing users to select a chapter to start a quiz.
    *   `frontend/src/components/QuizView.jsx`: Manages the quiz interface, fetching questions from the pre-generated bank, handling user answer selections, providing immediate feedback (correct/incorrect highlighting and explanation display), and implementing the adaptive learning logic by selecting alternate questions with matching concept tags.
    *   `frontend/src/services/supabase.js`: Supabase client configuration and data fetching functions.
    *   `frontend/src/App.css`: Contains custom styles for the application, including visual feedback for quiz answers.

### Deployment
*   **Frontend:** Deployed to Vercel.
*   **Database:** Supabase handles hosting, authentication, and database management.