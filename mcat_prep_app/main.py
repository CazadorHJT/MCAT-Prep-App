from fastapi import FastAPI, HTTPException
from typing import List
import random

from .supabase_client import supabase
from .question_generator import generate_questions_for_chapter

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the MCAT Prep App API"}

@app.get("/books")
def get_books():
    response = supabase.table("books").select("*").execute()
    if response.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch books")
    return response.data

@app.get("/books/{book_id}/chapters")
def get_chapters_for_book(book_id: str):
    response = supabase.table("chapters").select("*").eq("book_id", book_id).execute()
    if response.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch chapters")
    return response.data

@app.get("/chapters/{chapter_id}/questions")
def get_questions_for_chapter(chapter_id: int):
    # Fetch all questions for the chapter
    response = supabase.table("questions").select("*").eq("chapter_id", chapter_id).execute()
    if response.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch questions")
    
    all_questions = response.data
    
    # Return a random sample of 20 questions, or all questions if there are fewer than 20
    num_questions_to_sample = min(20, len(all_questions))
    sampled_questions = random.sample(all_questions, num_questions_to_sample)
    
    return sampled_questions
