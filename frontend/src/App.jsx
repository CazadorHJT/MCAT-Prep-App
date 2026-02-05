import { useState, useEffect } from 'react';
import { getBooks } from './services/api';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <>
      <h1>MCAT Prep App</h1>
      <div className="card">
        <h2>Available Books</h2>
        {loading && <p>Loading books...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul>
          {books.map((book) => (
            <li key={book.id}>{book.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;