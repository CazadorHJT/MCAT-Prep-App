import os
from .database import SessionLocal, engine
from . import models
from .epub_parser import get_book_chapters
from .question_generator import generate_questions_for_chapter

def seed_database():
    """
    Populates the database with books, chapters, and questions from the EPUB files.
    """
    # Create tables
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Path to the review books
    books_dir = "Review Book Files"
    
    # Clear existing data
    db.query(models.Question).delete()
    db.query(models.Chapter).delete()
    db.query(models.Book).delete()
    db.commit()


    for book_filename in os.listdir(books_dir):
        if book_filename.endswith(".epub"):
            book_path = os.path.join(books_dir, book_filename)
            
            # Use the filename as the title for now
            book_title = os.path.splitext(book_filename)[0]

            # Create the book
            book = models.Book(title=book_title, author="Kaplan Test Prep") # Assuming author for now
            db.add(book)
            db.commit()
            db.refresh(book)

            print(f"Processing book: {book_title}")

            # Get chapters from the epub
            chapters = get_book_chapters(book_path)
            
            for i, chapter_data in enumerate(chapters):
                chapter = models.Chapter(
                    title=chapter_data['title'],
                    content=chapter_data['content'],
                    chapter_number=i + 1,
                    book_id=book.id
                )
                db.add(chapter)
                db.commit()
                db.refresh(chapter)

                # Generate and add questions
                questions = generate_questions_for_chapter(chapter.content)
                for q_data in questions:
                    question = models.Question(
                        question_text=q_data['question_text'],
                        correct_answer=q_data['correct_answer'],
                        options=q_data['options'],
                        chapter_id=chapter.id
                    )
                    db.add(question)
                
                db.commit()
                print(f"  - Added chapter '{chapter.title}' with {len(questions)} questions.")

    db.close()

if __name__ == "__main__":
    seed_database()
