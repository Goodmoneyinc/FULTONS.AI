/*
  # Add Harvey AI-Inspired Features
  
  ## Overview
  This migration extends the legal AI platform with Harvey-inspired features:
  citations, conversational Q&A, workflows, and research capabilities.
  
  ## New Tables
  
  ### `citations`
  Tracks legal citations and sources to prevent AI hallucinations:
  - `id` (uuid, primary key) - Unique citation identifier
  - `document_id` (uuid, not null) - References documents.id
  - `citation_text` (text, not null) - The citation or source reference
  - `citation_type` (text, not null) - Type: case_law, statute, regulation, precedent
  - `jurisdiction` (text, nullable) - Legal jurisdiction (e.g., US, EU, UK)
  - `date_cited` (date, nullable) - Date of the cited source
  - `url` (text, nullable) - Link to source if available
  - `relevance_score` (numeric, default 0) - AI-assigned relevance (0-1)
  - `created_at` (timestamptz, default now())
  
  ### `chat_sessions`
  Stores conversational AI sessions for document Q&A:
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid, not null) - References auth.users
  - `document_id` (uuid, nullable) - Optional document context
  - `session_title` (text, not null) - Descriptive title
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  
  ### `chat_messages`
  Stores individual messages in chat sessions:
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid, not null) - References chat_sessions.id
  - `role` (text, not null) - user or assistant
  - `content` (text, not null) - Message content
  - `citations` (jsonb, default []) - Array of citation references
  - `created_at` (timestamptz, default now())
  
  ### `workflows`
  Pre-built automation templates for common legal processes:
  - `id` (uuid, primary key) - Unique workflow identifier
  - `name` (text, not null) - Workflow name
  - `description` (text, not null) - What the workflow does
  - `category` (text, not null) - contract_review, due_diligence, compliance
  - `prompt_template` (text, not null) - AI prompt template
  - `is_public` (boolean, default true) - Available to all users
  - `created_by` (uuid, nullable) - References auth.users (for custom workflows)
  - `created_at` (timestamptz, default now())
  
  ### `workflow_executions`
  Tracks workflow runs and results:
  - `id` (uuid, primary key) - Unique execution identifier
  - `workflow_id` (uuid, not null) - References workflows.id
  - `user_id` (uuid, not null) - References auth.users
  - `document_id` (uuid, not null) - References documents.id
  - `status` (text, not null) - pending, processing, completed, failed
  - `results` (jsonb, nullable) - Workflow output
  - `created_at` (timestamptz, default now())
  - `completed_at` (timestamptz, nullable)
  
  ### `research_queries`
  Legal research queries and results:
  - `id` (uuid, primary key) - Unique query identifier
  - `user_id` (uuid, not null) - References auth.users
  - `query_text` (text, not null) - Research question
  - `jurisdiction` (text, nullable) - Jurisdiction filter
  - `results` (jsonb, nullable) - Search results with citations
  - `created_at` (timestamptz, default now())
  
  ## Security
  All tables have RLS enabled with strict user-scoped access policies.
*/

-- Create citations table
CREATE TABLE IF NOT EXISTS citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  citation_text text NOT NULL,
  citation_type text NOT NULL CHECK (citation_type IN ('case_law', 'statute', 'regulation', 'precedent', 'treaty', 'other')),
  jurisdiction text,
  date_cited date,
  url text,
  relevance_score numeric DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  session_title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  citations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('contract_review', 'due_diligence', 'compliance', 'drafting', 'research')),
  prompt_template text NOT NULL,
  is_public boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  results jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Create research_queries table
CREATE TABLE IF NOT EXISTS research_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  jurisdiction text,
  results jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_citations_document_id ON citations(document_id);
CREATE INDEX IF NOT EXISTS idx_citations_type ON citations(citation_type);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_document_id ON chat_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_public ON workflows(is_public);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_research_queries_user_id ON research_queries(user_id);

-- Enable Row Level Security
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for citations
CREATE POLICY "Users can view citations for own documents"
  ON citations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = citations.document_id
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert citations for own documents"
  ON citations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = citations.document_id
      AND documents.owner_id = auth.uid()
    )
  );

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in own sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- RLS Policies for workflows
CREATE POLICY "Users can view public workflows or own workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create own workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view own workflow executions"
  ON workflow_executions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflow executions"
  ON workflow_executions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflow executions"
  ON workflow_executions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for research_queries
CREATE POLICY "Users can view own research queries"
  ON research_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own research queries"
  ON research_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default public workflows
INSERT INTO workflows (name, description, category, prompt_template, is_public) VALUES
  (
    'NDA Risk Assessment',
    'Comprehensive review of non-disclosure agreements for potential risks',
    'contract_review',
    'Analyze this NDA for: (1) Scope of confidential information, (2) Permitted disclosures, (3) Term and survival, (4) Return/destruction obligations. Document: {{document_content}}',
    true
  ),
  (
    'M&A Change of Control',
    'Identify change of control provisions that may impact acquisition',
    'due_diligence',
    'Review this document for change of control provisions, assignment restrictions, and consent requirements. Highlight any clauses that could block or delay an acquisition. Document: {{document_content}}',
    true
  ),
  (
    'GDPR Article 28 Compliance',
    'Verify data processing agreement meets GDPR Article 28 requirements',
    'compliance',
    'Check this DPA for: (1) Processing instructions, (2) Security measures, (3) Sub-processor provisions, (4) Data subject rights, (5) Audit rights, (6) Breach notification. Document: {{document_content}}',
    true
  ),
  (
    'SaaS Contract Review',
    'Analyze SaaS agreements for common risk factors',
    'contract_review',
    'Review this SaaS agreement for: (1) Service levels and uptime guarantees, (2) Data ownership and portability, (3) Liability caps, (4) Termination rights, (5) Auto-renewal terms. Document: {{document_content}}',
    true
  ),
  (
    'IP Assignment Check',
    'Verify intellectual property assignment clauses',
    'contract_review',
    'Examine this agreement for IP assignment provisions: (1) Scope of IP transferred, (2) Exclusions, (3) Pre-existing IP, (4) Future developments, (5) Moral rights waiver. Document: {{document_content}}',
    true
  )
ON CONFLICT DO NOTHING;
