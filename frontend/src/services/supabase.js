import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bzasecbqlgmkfsbwrjly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YXNlY2JxbGdta2ZzYndyamx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTA0ODksImV4cCI6MjA4NTg4NjQ4OX0.5NwUM3aQ5pK9GmJVd_p85Y5_8OeRb2Yzs30LcqMIPaY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
