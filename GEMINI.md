# Gemini Code Companion: MCAT Prep App

This document provides a comprehensive overview of the MCAT Prep App project, designed to be used as a context for AI-driven development.

## Project Overview

The MCAT Prep App is a full-stack web application designed to help users study for the MCAT using their own EPUB review books. The application's core philosophy is to facilitate mastery through active recall and error-driven reinforcement.

The project is structured as a monorepo with two main parts:
*   **Backend:** A Python-based API built with **FastAPI**. It is responsible for parsing the EPUB book files, seeding a database, and serving content (books, chapters, questions) to the frontend.
*   **Frontend:** A modern web application built with **React** (using Vite). It provides the user interface for browsing content, taking quizzes, and tracking progress.

### Key Features:
*   **EPUB Content Ingestion:** Parses EPUB files to extract chapters and content.
*   **Database:** Uses **SQLite** to store information about books, chapters, and questions.
*   **Question Generation:** Designed to use a Large Language Model (LLM) to generate MCAT-style multiple-choice questions from the book content.
*   **Adaptive Learning:** Implements an error-driven reinforcement algorithm to help users achieve mastery.
*   **RESTful API:** Provides endpoints for the frontend to retrieve all necessary data.

---

## Building and Running

### 1. Backend (FastAPI)

The backend is managed using **Poetry**.

**Setup (run once):**
```bash
# Install backend dependencies
poetry install
```

**Database Seeding (run once or to reset):**
This script parses the EPUBs in `Review Book Files/`, and populates the SQLite database (`mcat_prep.db`) with books, chapters, and mock questions.
```bash
poetry run python -m mcat_prep_app.seed_database
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

**Running the Frontend Development Server:**
```bash
# Navigate to the frontend directory if you are not already there
cd frontend

# This will start the dev server, typically on http://localhost:5173
npm run dev
```

**Important:** The backend server must be running for the frontend application to successfully fetch data.

---

## Development Conventions

### Backend
*   **Framework:** FastAPI is used for building the API, which provides automatic interactive documentation (via Swagger UI at `/docs` when the server is running).
*   **Database:** SQLAlchemy is used as the ORM to interact with the SQLite database.
*   **Dependencies:** Python package dependencies are managed by Poetry.
*   **Structure:**
    *   `mcat_prep_app/main.py`: The main API file containing the endpoint definitions.
    *   `mcat_prep_app/models.py`: Defines the database schema.
    *   `mcat_prep_app/database.py`: Configures the database connection.
    *   `mcat_prep_app/epub_parser.py`: Contains the logic for parsing EPUB files.
    *   `mcat_prep_app/question_generator.py`: Holds the (currently mock) logic for generating questions.
    *   `mcat_prep_app/seed_database.py`: The script for populating the database.

### Frontend
*   **Framework:** React with Vite provides a fast development environment.
*   **API Communication:** The `axios` library is used for making HTTP requests to the backend. The API service is centralized in `frontend/src/services/api.js`.
*   **Dependencies:** Frontend packages are managed by npm.
*   **Structure:**
    *   `frontend/src/App.jsx`: The main application component.
    *   `frontend/src/components/`: Directory for reusable React components.
    *   `frontend/src/services/`: Directory for modules that interact with external services (like the backend API).
