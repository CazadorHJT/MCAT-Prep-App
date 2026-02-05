import { useState, useEffect } from 'react';
import { getBooks, getChaptersByBook } from './services/api';
import ChapterList from './components/ChapterList';
import QuizView from './components/QuizView';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books on initial load
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await getBooks();
        setBooks(response.data);
      } catch (err) {
        setError('Failed to fetch books. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Fetch chapters when a book is selected
  useEffect(() => {
    if (selectedBook) {
      const fetchChapters = async () => {
        try {
          setLoading(true);
          const response = await getChaptersByBook(selectedBook.id);
          setChapters(response.data);
        } catch (err) {
          setError(`Failed to fetch chapters for ${selectedBook.title}.`);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchChapters();
    }
  }, [selectedBook]);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setSelectedChapterId(null);
  };

  const handleChapterSelect = (chapterId) => {
    setSelectedChapterId(chapterId);
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setChapters([]);
    setSelectedChapterId(null);
  };
  
  const handleBackToChapters = () => {
    setSelectedChapterId(null);
  };

  if (loading && !books.length) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const renderContent = () => {
    if (selectedChapterId) {
      return (
        <div>
          <button onClick={handleBackToChapters}>Back to Chapters</button>
          <QuizView chapterId={selectedChapterId} />
        </div>
      );
    }
    if (selectedBook) {
      return (
        <div>
          <button onClick={handleBackToBooks}>Back to Books</button>
          <h2>{selectedBook.title}</h2>
          {loading ? <p>Loading chapters...</p> : <ChapterList chapters={chapters} onSelectChapter={handleChapterSelect} />}
        </div>
      );
    }
    return (
      <div>
        <h2>Available Books</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <button onClick={() => handleBookSelect(book)}>
                {book.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <h1>MCAT Prep App</h1>
      <div className="card">
        {renderContent()}
      </div>
    </>
  );
}

export default App;