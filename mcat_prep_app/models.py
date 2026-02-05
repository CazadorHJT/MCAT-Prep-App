from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String)
    
    chapters = relationship("Chapter", back_populates="book")

class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    chapter_number = Column(Integer)
    content = Column(Text)
    book_id = Column(Integer, ForeignKey("books.id"))

    book = relationship("Book", back_populates="chapters")
    questions = relationship("Question", back_populates="chapter")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    correct_answer = Column(String, nullable=False)
    # Options will be stored as a JSON string
    options = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True) # New field for explanation
    chapter_id = Column(Integer, ForeignKey("chapters.id"))

    chapter = relationship("Chapter", back_populates="questions")
