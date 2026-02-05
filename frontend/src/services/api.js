import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getBooks = () => {
  return apiClient.get('/books');
};

export const getChaptersByBook = (bookId) => {
  return apiClient.get(`/books/${bookId}/chapters`);
};

export const getQuestionsByChapter = (chapterId) => {
  return apiClient.get(`/chapters/${chapterId}/questions`);
};
