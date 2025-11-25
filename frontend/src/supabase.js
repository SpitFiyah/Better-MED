import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnhefxzyybvquuepuleo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaGVmeHp5eWJ2cXV1ZXB1bGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzkwNzksImV4cCI6MjA3OTY1NTA3OX0.RAQDocBYugTe0u9S7L60caBQK5F32gvCybvP1Yu5RwA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);