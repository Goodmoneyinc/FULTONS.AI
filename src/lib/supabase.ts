import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Document = {
  id: string;
  owner_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  upload_date: string;
  processed_date: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentContent = {
  id: string;
  document_id: string;
  content_text: string;
  page_count: number;
  character_count: number;
  created_at: string;
  updated_at: string;
};
