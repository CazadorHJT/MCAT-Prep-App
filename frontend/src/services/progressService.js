import { supabase } from './supabase';

export const recordAnswer = async (userId, questionId, correct, conceptTags = []) => {
  // Insert into user_progress
  const { error: progressError } = await supabase
    .from('user_progress')
    .insert({
      user_id: userId,
      question_id: questionId,
      correct,
      answered_at: new Date().toISOString(),
    });

  if (progressError) {
    console.error('Error recording progress:', progressError);
    return;
  }

  // Update concept mastery for each concept tag
  for (const concept of conceptTags) {
    // Try to get existing mastery record
    const { data: existing } = await supabase
      .from('concept_mastery')
      .select('*')
      .eq('user_id', userId)
      .eq('concept', concept)
      .single();

    if (existing) {
      // Update existing record
      const newTotal = existing.total_attempts + 1;
      const newCorrect = existing.correct_attempts + (correct ? 1 : 0);
      const newMastery = (newCorrect / newTotal) * 100;

      await supabase
        .from('concept_mastery')
        .update({
          total_attempts: newTotal,
          correct_attempts: newCorrect,
          mastery_percentage: newMastery,
          last_practiced: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('concept', concept);
    } else {
      // Insert new record
      await supabase
        .from('concept_mastery')
        .insert({
          user_id: userId,
          concept,
          total_attempts: 1,
          correct_attempts: correct ? 1 : 0,
          mastery_percentage: correct ? 100 : 0,
          last_practiced: new Date().toISOString(),
        });
    }
  }
};

export const getConceptMastery = async (userId) => {
  const { data, error } = await supabase
    .from('concept_mastery')
    .select('*')
    .eq('user_id', userId)
    .order('mastery_percentage', { ascending: false });

  if (error) {
    console.error('Error fetching concept mastery:', error);
    return [];
  }

  return data || [];
};

export const getProgressStats = async (userId) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('correct')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching progress stats:', error);
    return { total: 0, correct: 0, accuracy: 0 };
  }

  const total = data?.length || 0;
  const correct = data?.filter(r => r.correct).length || 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { total, correct, accuracy };
};

/**
 * Get progress organized by book and chapter
 * Returns hierarchical data structure:
 * {
 *   books: [
 *     {
 *       id, name, total, correct, accuracy,
 *       chapters: [
 *         {
 *           id, title, chapter_number, total, correct, accuracy,
 *           concepts: [{ concept, total_attempts, correct_attempts, mastery_percentage }]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export const getHierarchicalProgress = async (userId) => {
  // Fetch all user progress with question, chapter, and book data
  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('correct, question_id')
    .eq('user_id', userId);

  if (progressError) {
    console.error('Error fetching progress:', progressError);
    return { books: [] };
  }

  if (!progressData || progressData.length === 0) {
    return { books: [] };
  }

  // Get unique question IDs
  const questionIds = [...new Set(progressData.map(p => p.question_id))];

  // Fetch questions with their chapter info
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('id, chapter_id, concept_tags')
    .in('id', questionIds);

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    return { books: [] };
  }

  // Get unique chapter IDs
  const chapterIds = [...new Set(questionsData.map(q => q.chapter_id))];

  // Fetch chapters with their book info
  const { data: chaptersData, error: chaptersError } = await supabase
    .from('chapters')
    .select('id, book_id, title, chapter_number')
    .in('id', chapterIds);

  if (chaptersError) {
    console.error('Error fetching chapters:', chaptersError);
    return { books: [] };
  }

  // Get unique book IDs
  const bookIds = [...new Set(chaptersData.map(c => c.book_id))];

  // Fetch books
  const { data: booksData, error: booksError } = await supabase
    .from('books')
    .select('id, name')
    .in('id', bookIds);

  if (booksError) {
    console.error('Error fetching books:', booksError);
    return { books: [] };
  }

  // Fetch concept mastery
  const { data: masteryData } = await supabase
    .from('concept_mastery')
    .select('*')
    .eq('user_id', userId);

  // Create lookup maps
  const questionMap = new Map(questionsData.map(q => [q.id, q]));
  const chapterMap = new Map(chaptersData.map(c => [c.id, c]));
  const bookMap = new Map(booksData.map(b => [b.id, b]));
  const masteryMap = new Map((masteryData || []).map(m => [m.concept, m]));

  // Build hierarchical structure
  const bookStats = new Map(); // book_id -> { total, correct, chapters: Map }

  for (const progress of progressData) {
    const question = questionMap.get(progress.question_id);
    if (!question) continue;

    const chapter = chapterMap.get(question.chapter_id);
    if (!chapter) continue;

    const book = bookMap.get(chapter.book_id);
    if (!book) continue;

    // Initialize book stats if needed
    if (!bookStats.has(book.id)) {
      bookStats.set(book.id, {
        id: book.id,
        name: book.name,
        total: 0,
        correct: 0,
        chapters: new Map(),
      });
    }

    const bookStat = bookStats.get(book.id);
    bookStat.total++;
    if (progress.correct) bookStat.correct++;

    // Initialize chapter stats if needed
    if (!bookStat.chapters.has(chapter.id)) {
      bookStat.chapters.set(chapter.id, {
        id: chapter.id,
        title: chapter.title,
        chapter_number: chapter.chapter_number,
        total: 0,
        correct: 0,
        conceptSet: new Set(),
      });
    }

    const chapterStat = bookStat.chapters.get(chapter.id);
    chapterStat.total++;
    if (progress.correct) chapterStat.correct++;

    // Track concepts for this chapter
    if (question.concept_tags) {
      for (const tag of question.concept_tags) {
        chapterStat.conceptSet.add(tag);
      }
    }
  }

  // Convert to final structure
  const books = Array.from(bookStats.values()).map(book => ({
    id: book.id,
    name: book.name,
    total: book.total,
    correct: book.correct,
    accuracy: book.total > 0 ? Math.round((book.correct / book.total) * 100) : 0,
    chapters: Array.from(book.chapters.values())
      .sort((a, b) => a.chapter_number - b.chapter_number)
      .map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        chapter_number: chapter.chapter_number,
        total: chapter.total,
        correct: chapter.correct,
        accuracy: chapter.total > 0 ? Math.round((chapter.correct / chapter.total) * 100) : 0,
        concepts: Array.from(chapter.conceptSet)
          .map(concept => masteryMap.get(concept))
          .filter(Boolean)
          .sort((a, b) => b.mastery_percentage - a.mastery_percentage),
      })),
  }));

  // Sort books by name
  books.sort((a, b) => a.name.localeCompare(b.name));

  return { books };
};
