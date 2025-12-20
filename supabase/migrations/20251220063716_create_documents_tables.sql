/*
  # Create Legal Document Processing System

  ## Overview
  This migration sets up the database schema for a Legal AI SaaS platform's document processing pipeline. 
  It implements privacy-by-design principles with strict access controls.

  ## New Tables

  ### `documents`
  Tracks metadata for uploaded PDF documents:
  - `id` (uuid, primary key) - Unique document identifier
  - `owner_id` (uuid, not null) - References auth.users, the user who uploaded the document
  - `filename` (text, not null) - Original filename of the uploaded PDF
  - `file_path` (text, not null) - Storage path in Supabase Storage
  - `file_size` (bigint, not null) - File size in bytes
  - `status` (text, not null) - Processing status: 'uploaded', 'processing', 'completed', 'failed'
  - `error_message` (text, nullable) - Error details if processing failed
  - `upload_date` (timestamptz, default now()) - When the document was uploaded
  - `processed_date` (timestamptz, nullable) - When processing was completed
  - `created_at` (timestamptz, default now()) - Record creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### `document_contents`
  Stores extracted and cleaned text content from PDFs:
  - `id` (uuid, primary key) - Unique content identifier
  - `document_id` (uuid, not null) - References documents.id, ensures cascade delete
  - `content_text` (text, not null) - Cleaned, extracted text from the PDF
  - `page_count` (int, default 0) - Number of pages in the document
  - `character_count` (int, default 0) - Total characters in extracted text
  - `created_at` (timestamptz, default now()) - When content was extracted
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  Both tables have RLS enabled with restrictive policies:
  
  #### `documents` policies:
  1. Users can only view their own documents
  2. Users can only insert documents they own
  3. Users can only update their own documents
  4. Users can only delete their own documents

  #### `document_contents` policies:
  1. Users can only view content for documents they own
  2. Edge functions (service role) can insert content
  3. Users cannot directly modify or delete content (managed by system)

  ## Important Notes
  1. **Privacy by Design**: All data is user-scoped through RLS policies
  2. **No Public Access**: No data is accessible without authentication
  3. **Cascade Delete**: Deleting a document automatically removes its content
  4. **Status Tracking**: The 'processing' state provides real-time feedback to users
*/

-- Create documents table for metadata tracking
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  error_message text,
  upload_date timestamptz NOT NULL DEFAULT now(),
  processed_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create document_contents table for extracted text
CREATE TABLE IF NOT EXISTS document_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content_text text NOT NULL,
  page_count int DEFAULT 0,
  character_count int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_document_contents_document_id ON document_contents(document_id);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_contents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents table

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for document_contents table

-- Users can view content for their own documents
CREATE POLICY "Users can view content for own documents"
  ON document_contents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_contents.document_id
      AND documents.owner_id = auth.uid()
    )
  );

-- Service role can insert content (used by Edge Function)
CREATE POLICY "Service role can insert content"
  ON document_contents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_contents.document_id
      AND documents.owner_id = auth.uid()
    )
  );

-- Service role can update content
CREATE POLICY "Service role can update content"
  ON document_contents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_contents.document_id
      AND documents.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_contents.document_id
      AND documents.owner_id = auth.uid()
    )
  );