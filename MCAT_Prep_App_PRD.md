# Product Requirements Document: MCAT Prep App

## 1. Overview

This document outlines the requirements for a personalized MCAT study application. The primary goal of this app is to help a user achieve **mastery, not just exposure**, by building active-recall-based problem sets using MCAT-level multiple-choice questions. The app will track the user's progress, identify areas of weakness, and adapt to their learning pace using a sophisticated error-driven reinforcement algorithm.

## 2. Core Features

### 2.1. Content Organization

*   **Book-Based Sections:** The application will be divided into seven distinct sections, each corresponding to one of the user's provided MCAT review books.
*   **Chapter-Based Grouping:** Within each book section, study material and questions will be further organized by chapter, mirroring the structure of the source book.

The seven sections will be based on the following books:
1.  KAPLAN MCAT BIOLOGY REVIEW 2024-2025
2.  KAPLAN MCAT PHYSICS AND MATH REVIEW 2024-2025
3.  MCAT Behavioral Sciences Review 2023-2024
4.  MCAT Biochemistry Review 2022-2023
5.  MCAT Critical Analysis and Reasoning Skills Review
6.  MCAT general chemistry review 2024-2025
7.  MCAT Organic Chemistry Review 2024-2025

### 2.2. Question Generation & Design Standards

*   **Automated Question Creation:** The application will parse the content of each chapter from the provided EPUB files.
*   **Comprehensive Coverage:** It will generate a robust set of questions (and corresponding answers) designed to cover all the key topics and concepts within each chapter.
*   **Multiple Choice Format:** All generated questions will contain exactly 4 answer choices.
*   **MCAT Wording Standard:** The wording and style of the questions will adhere strictly to the format typically found in official MCAT examinations.
*   **Question Design Principles:**
    *   **MCAT-Style:** Questions will focus on conceptual reasoning, not rote memorization.
    *   **Single Correct Answer:** Each question will have one clearly correct answer.
    *   **Plausible Distractors:** Incorrect answer choices (distractors) will be plausible and based on common MCAT misconceptions.
    *   **Self-Contained:** Questions will be solvable without external resources.
    *   **Difficulty Matching:** Questions will match the difficulty of AAMC practice questions.
*   **Answer Explanations:** For every question, the app will provide a detailed explanation. If the user answers correctly, the explanation will clarify why their answer was right. If the user answers incorrectly, the explanation will clarify why their chosen answer was wrong and explain the correct answer.

### 2.3. Adaptive Learning Algorithm (Error-Driven Reinforcement & Mastery)

*   **Performance Tracking:** The app will monitor the user's answers to each question, tracking correct and incorrect responses.
*   **Mastery Score:** Each concept or question will have an associated "mastery" level.
*   **Error-Driven Reinforcement Rules:**
    *   **Correct Answer:** If the user answers a question correctly, that specific question will be retired from the current session.
    *   **Incorrect Answer:** If the user answers a question incorrectly, a *new* question testing the *same underlying concept* will be generated. This new question will feature a different framing, comparison, or application. This newly generated question will then be inserted randomly into the remaining problem set. The original incorrect question will *not* be repeated verbatim.
*   **Spaced Repetition:** Questions associated with concepts having lower mastery levels (i.e., topics the user struggles with) will appear more frequently, and new variations will be introduced until the user demonstrates consistent understanding.
*   **Mastery & Completion Rules:**
    *   A study session will continue until all concepts tested have been answered correctly at least once.
    *   If the user repeatedly misses a concept, the app will temporarily simplify the question on that concept. Once understanding is demonstrated at the simplified level, the app will return to full MCAT-level difficulty for that concept.
    *   Study sessions will *not* prematurely end; they will continue until mastery is achieved for the selected concepts.

### 2.4. Practice & Quiz Modes

The user will have the ability to generate question sets in two primary modes:
1.  **Chapter Quiz:** A set of questions focused on a single chapter.
2.  **Book Quiz:** A comprehensive set of questions covering all chapters within a single book.

## 3. Proposed Technology Stack

*   **Backend:** Python
    *   **EPUB Parsing:** `ebooklib` to extract content from the book files.
    *   **API:** FastAPI or Flask to create a web server that provides the questions and tracks progress.
    *   **Database:** SQLite for simplicity to store books, chapters, questions, and user progress.
*   **Frontend:** React or Vue.js (Web-based)
    *   A modern JavaScript framework to build an interactive and user-friendly interface.
*   **Question Generation:** A Large Language Model (LLM) will be used to read the extracted chapter text and generate high-quality questions and answers, including explanations, multiple-choice options, and adherence to MCAT-style guidelines.

## 4. Tone & Style

*   **Audience Assumption:** Assume the user is a pre-med student actively studying for the MCAT.
*   **Communication Style:** Be precise, efficient, and explanatory.
*   **Clarity:** Avoid superfluous language ("fluff"), but ensure all explanations are intuitive and easy to understand.
*   **Terminology:** Use correct biochemical, biological, chemical, and physical terminology consistently.

## 5. Development Roadmap

### Phase 1: Content Processing and Backend Setup
1.  **Initialize Project:** Set up the Python backend environment.
2.  **Develop EPUB Parser:** Write scripts to read the `.epub` files, identify the table of contents, and extract text from each chapter.
3.  **Database Modeling:** Design and create the database schema to store books, chapters, and questions.
4.  **Content Ingestion:** Populate the database with the structured content from the books.

### Phase 2: Question Generation
1.  **Integrate LLM:** Connect to a large language model API.
2.  **Develop Generation Pipeline:** Create a process that feeds chapter text to the LLM and formats the output into a standardized question/answer format.
3.  **Populate Questions:** Generate and store questions for each chapter in the database, ensuring they meet the specified design standards.

### Phase 3: API and Learning Algorithm
1.  **Build API Endpoints:** Create the necessary API endpoints to:
    *   Fetch the list of books and chapters.
    *   Generate and serve quizzes based on user selections (by chapter or book).
    *   Receive user answers and update the mastery score for each question.
2.  **Implement Learning Logic:** Develop the error-driven reinforcement algorithm and mastery rules to prioritize questions and adapt difficulty.

### Phase 4: Frontend Development
1.  **Initialize Project:** Set up the frontend project (e.g., with Create React App).
2.  **UI/UX Design:** Create the user interface for:
    *   Navigating books and chapters.
    *   Taking quizzes with real-time feedback and explanations.
    *   Viewing results and progress, reflecting mastery levels.
3.  **API Integration:** Connect the frontend to the backend API to fetch data and save progress.

### Phase 5: Testing and Deployment
1.  **End-to-End Testing:** Thoroughly test all aspects of the application, including the adaptive learning algorithm and question quality.
2.  **Deployment:** Deploy the application for use.
