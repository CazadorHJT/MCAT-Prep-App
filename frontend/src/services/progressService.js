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
