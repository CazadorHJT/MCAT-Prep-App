import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { getBooks, getChaptersByBook } from './services/api';
import ChapterList from './components/ChapterList';
import QuizView from './components/QuizView';
import AuthForm from './components/AuthForm';
import ProgressDashboard from './components/ProgressDashboard';
import './App.css';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

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
          setError(`Failed to fetch chapters for ${selectedBook.name}.`);
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <>
        <header className="app-header">
          <h1>MCAT Prep</h1>
          <p className="subtitle">Your focused study companion</p>
        </header>
        <main className="card">
          <AuthForm />
        </main>
      </>
    );
  }

  if (loading && !books.length) {
    return (
      <div className="loading">
        Loading your study materials...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    );
  }

  // Show dashboard if toggled
  if (showDashboard) {
    return (
      <>
        <header className="app-header">
          <h1>MCAT Prep</h1>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button className="header-button" onClick={handleSignOut}>Sign Out</button>
          </div>
        </header>
        <main className="card">
          <ProgressDashboard onClose={() => setShowDashboard(false)} />
        </main>
      </>
    );
  }

  const renderContent = () => {
    if (selectedChapterId) {
      return (
        <div>
          <button className="nav-button" onClick={handleBackToChapters}>
            Back to Chapters
          </button>
          <QuizView chapterId={selectedChapterId} />
        </div>
      );
    }
    if (selectedBook) {
      return (
        <div>
          <button className="nav-button" onClick={handleBackToBooks}>
            Back to Books
          </button>
          <div className="section-title">
            <h2>{selectedBook.name}</h2>
          </div>
          {loading ? (
            <div className="loading">Loading chapters...</div>
          ) : (
            <ChapterList chapters={chapters} onSelectChapter={handleChapterSelect} />
          )}
        </div>
      );
    }
    return (
      <div>
        <div className="section-title">
          <span className="icon">📚</span>
          <h2>Select a Review Book</h2>
        </div>
        <ul className="book-list">
          {books.map((book) => (
            <li key={book.id} className="book-item">
              <button className="book-button" onClick={() => handleBookSelect(book)}>
                {book.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <header className="app-header">
        <h1>MCAT Prep</h1>
        <div className="user-info">
          <button className="header-button progress-button" onClick={() => setShowDashboard(true)}>
            My Progress
          </button>
          <span className="user-email">{user.email}</span>
          <button className="header-button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>
      <main className="card">
        {renderContent()}
      </main>
    </>
  );
}

export default App;
