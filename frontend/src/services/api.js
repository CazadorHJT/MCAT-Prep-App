import { supabase } from './supabase';

export const getBooks = async () => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('name');

  if (error) throw error;
  return { data };
};

export const getChaptersByBook = async (bookId) => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('chapter_number');

  if (error) throw error;
  return { data };
};

export const getQuestionsByChapter = async (chapterId) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('chapter_id', chapterId);

  if (error) throw error;

  // Return a random sample of 20 questions, or all if fewer than 20
  const shuffled = data.sort(() => Math.random() - 0.5);
  const sampled = shuffled.slice(0, Math.min(20, shuffled.length));

  return { data: sampled };
};
