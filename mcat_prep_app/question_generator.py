import json

def generate_questions_for_chapter(chapter_content: str, num_questions: int = 5):
    """
    Generates mock questions for a given chapter content.
    In a real application, this would use an LLM to generate questions.
    """
    questions = []
    for i in range(num_questions):
        questions.append({
            "question_text": f"This is mock question {i+1} for the chapter, formatted like an MCAT question.",
            "correct_answer": "Option A",
            "options": json.dumps(["Option A", "Option B", "Option C", "Option D"]),
            "explanation": f"Explanation for question {i+1}: Option A is correct because [reason]. Options B, C, and D are incorrect because [reasons]."
        })
    return questions
