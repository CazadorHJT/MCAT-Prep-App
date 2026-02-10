"""
MCAT Prep App - Database Seeder

Syncs pre-generated questions from local JSON files to Supabase.
Questions are stored in the questions/ directory organized by book and chapter.

Usage:
    poetry run python -m mcat_prep_app.seed_database
    poetry run python -m mcat_prep_app.seed_database --book biology
    poetry run python -m mcat_prep_app.seed_database --clear-only
"""

import argparse
import json
from pathlib import Path

from .supabase_client import supabase


# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
QUESTIONS_DIR = PROJECT_ROOT / "questions"
BOOK_MAPPING_FILE = QUESTIONS_DIR / "book-mapping.json"


def load_book_mapping():
    """Load the book mapping configuration."""
    with open(BOOK_MAPPING_FILE, "r") as f:
        return json.load(f)["books"]


def clear_all_data():
    """Clear all data from Supabase tables."""
    print("Clearing existing data from Supabase...")

    # Delete in order of dependencies (children first)
    try:
        # Clear user progress and mastery first (if they exist)
        supabase.table("concept_mastery").delete().neq("id", 0).execute()
        print("  - Cleared concept_mastery")
    except Exception:
        pass  # Table might not exist yet

    try:
        supabase.table("user_progress").delete().neq("id", 0).execute()
        print("  - Cleared user_progress")
    except Exception:
        pass

    # Clear questions (use text-based id comparison)
    supabase.table("questions").delete().neq("id", "").execute()
    print("  - Cleared questions")

    # Clear chapters
    supabase.table("chapters").delete().neq("id", 0).execute()
    print("  - Cleared chapters")

    # Clear books (use text-based id comparison)
    supabase.table("books").delete().neq("id", "").execute()
    print("  - Cleared books")

    print("All data cleared.\n")


def seed_books():
    """Seed the books table from book-mapping.json."""
    print("Seeding books...")
    mapping = load_book_mapping()

    for book in mapping:
        try:
            supabase.table("books").upsert({
                "id": book["id"],
                "name": book["name"]
            }).execute()
            print(f"  - {book['id']}: {book['name']}")
        except Exception as e:
            print(f"  ERROR inserting book {book['id']}: {e}")

    print(f"Seeded {len(mapping)} books.\n")


def seed_chapters_and_questions(book_id: str = None):
    """
    Seed chapters and questions from JSON files.
    If book_id is specified, only seed that book.
    """
    mapping = load_book_mapping()

    if book_id:
        books_to_process = [b for b in mapping if b["id"] == book_id]
        if not books_to_process:
            print(f"ERROR: Unknown book ID: {book_id}")
            return
    else:
        books_to_process = mapping

    total_questions = 0
    total_chapters = 0

    for book in books_to_process:
        bid = book["id"]
        book_dir = QUESTIONS_DIR / bid

        if not book_dir.exists():
            print(f"WARNING: No questions directory for {bid}")
            continue

        print(f"\nProcessing: {book['name']}")

        # Find all chapter JSON files
        chapter_files = sorted(book_dir.glob("chapter-*.json"))

        # Skip example files
        chapter_files = [f for f in chapter_files if "example" not in f.name]

        if not chapter_files:
            print(f"  No chapter files found in {book_dir}")
            continue

        for chapter_file in chapter_files:
            try:
                with open(chapter_file, "r") as f:
                    data = json.load(f)

                chapter_num = data["chapter"]
                chapter_title = data["chapter_title"]
                questions = data["questions"]

                # Insert/update chapter
                chapter_result = supabase.table("chapters").upsert({
                    "book_id": bid,
                    "chapter_number": chapter_num,
                    "title": chapter_title
                }, on_conflict="book_id,chapter_number").execute()

                if not chapter_result.data:
                    print(f"  ERROR: Failed to insert chapter {chapter_num}")
                    continue

                chapter_id = chapter_result.data[0]["id"]
                total_chapters += 1

                # Prepare questions for insertion
                questions_to_insert = []
                for q in questions:
                    questions_to_insert.append({
                        "id": q["id"],
                        "chapter_id": chapter_id,
                        "question_text": q["question_text"],
                        "options": q["options"],  # Already a list, will be stored as JSONB
                        "correct_answer": q["correct_answer"],
                        "explanation": q["explanation"],
                        "concept_tags": q.get("concept_tags", []),
                        "difficulty": q.get("difficulty", "medium")
                    })

                # Batch insert questions (upsert to handle re-runs)
                if questions_to_insert:
                    supabase.table("questions").upsert(
                        questions_to_insert,
                        on_conflict="id"
                    ).execute()
                    total_questions += len(questions_to_insert)

                print(f"  Chapter {chapter_num}: {chapter_title} ({len(questions)} questions)")

            except json.JSONDecodeError as e:
                print(f"  ERROR: Invalid JSON in {chapter_file}: {e}")
            except Exception as e:
                print(f"  ERROR processing {chapter_file}: {e}")

    print(f"\n{'='*50}")
    print(f"Seeding complete!")
    print(f"  Total chapters: {total_chapters}")
    print(f"  Total questions: {total_questions}")


def get_stats():
    """Print current database statistics."""
    print("\nDatabase Statistics:")

    books = supabase.table("books").select("id", count="exact").execute()
    print(f"  Books: {books.count}")

    chapters = supabase.table("chapters").select("id", count="exact").execute()
    print(f"  Chapters: {chapters.count}")

    questions = supabase.table("questions").select("id", count="exact").execute()
    print(f"  Questions: {questions.count}")


def main():
    parser = argparse.ArgumentParser(
        description="Seed the Supabase database with MCAT questions"
    )
    parser.add_argument(
        "--book",
        type=str,
        help="Only seed a specific book (e.g., 'biology')"
    )
    parser.add_argument(
        "--clear-only",
        action="store_true",
        help="Only clear data, don't seed"
    )
    parser.add_argument(
        "--no-clear",
        action="store_true",
        help="Don't clear existing data before seeding"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show database statistics"
    )

    args = parser.parse_args()

    if args.stats:
        get_stats()
        return

    if args.clear_only:
        clear_all_data()
        return

    if not args.no_clear:
        clear_all_data()

    seed_books()
    seed_chapters_and_questions(args.book)
    get_stats()


if __name__ == "__main__":
    main()
