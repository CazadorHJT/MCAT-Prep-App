from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import models
from .database import SessionLocal, engine

app = FastAPI()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the MCAT Prep App API"}

@app.get("/books")
def get_books(db: Session = Depends(get_db)):
    books = db.query(models.Book).all()
    return books

@app.get("/books/{book_id}/chapters")
def get_chapters_for_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book.chapters

@app.get("/chapters/{chapter_id}/questions")
def get_questions_for_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter.questions

@app.post("/questions/regenerate")
def regenerate_question(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # In a real application, you might pass more context to the generator
    # For now, we just use the chapter content to generate a new mock question
    new_question_data = generate_questions_for_chapter(chapter.content, num_questions=1)[0]
    
    # We can create a new question object but not save it to the DB,
    # just return it to the frontend to be injected into the current quiz.
    # This avoids cluttering the DB with dynamically generated questions.
    new_question = {
        "question_text": new_question_data["question_text"],
        "correct_answer": new_question_data["correct_answer"],
        "options": new_question_data["options"],
        "explanation": new_question_data["explanation"],
        "chapter_id": chapter_id,
         # A temporary ID can be useful for the frontend key
        "id": f"temp-{chapter_id}-{db.query(models.Question).count() + 1}"
    }

    return new_question
