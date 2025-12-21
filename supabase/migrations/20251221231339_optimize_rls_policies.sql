/*
  # Optimize RLS policies for better performance

  1. Changes
    - Replace all `auth.uid()` calls with `(select auth.uid())` in RLS policies
    - Replace all `auth.role()` calls with `(select auth.role())` in RLS policies
    - This prevents re-evaluation of auth functions for each row

  2. Performance Impact
    - Significantly improves query performance at scale
    - Auth functions are evaluated once per query instead of once per row
    - Reduces CPU usage and improves response times

  3. Tables Updated
    - documents
    - document_contents
    - citations
    - chat_sessions
    - chat_messages
    - workflows
    - workflow_executions
    - research_queries
    - integrations

  4. Notes
    - Uses DROP POLICY IF EXISTS to safely remove old policies
    - Recreates policies with optimized versions
    - Maintains same security rules with better performance
*/

-- Documents table policies
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = owner_id);

-- Document contents table policies
DROP POLICY IF EXISTS "Users can view content for own documents" ON document_contents;
DROP POLICY IF EXISTS "Service role can insert content" ON document_contents;
DROP POLICY IF EXISTS "Service role can update content" ON document_contents;

CREATE POLICY "Users can view content for own documents"
  ON document_contents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_contents.document_id
      AND documents.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Service role can insert content"
  ON document_contents FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.role()) = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_contents.document_id
      AND documents.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Service role can update content"
  ON document_contents FOR UPDATE
  TO authenticated
  USING ((select auth.role()) = 'service_role' OR
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_contents.document_id
      AND documents.owner_id = (select auth.uid())
    )
  );

-- Citations table policies
DROP POLICY IF EXISTS "Users can view citations for own documents" ON citations;
DROP POLICY IF EXISTS "Users can insert citations for own documents" ON citations;

CREATE POLICY "Users can view citations for own documents"
  ON citations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = citations.document_id
      AND documents.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert citations for own documents"
  ON citations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = citations.document_id
      AND documents.owner_id = (select auth.uid())
    )
  );

-- Chat sessions table policies
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;

CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Chat messages table policies
DROP POLICY IF EXISTS "Users can view messages in own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in own sessions" ON chat_messages;

CREATE POLICY "Users can view messages in own sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in own sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = (select auth.uid())
    )
  );

-- Workflows table policies
DROP POLICY IF EXISTS "Users can view public workflows or own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can create own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete own workflows" ON workflows;

CREATE POLICY "Users can view public workflows or own workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = (select auth.uid()));

CREATE POLICY "Users can create own workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()) OR created_by IS NULL);

CREATE POLICY "Users can update own workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Users can delete own workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

-- Workflow executions table policies
DROP POLICY IF EXISTS "Users can view own workflow executions" ON workflow_executions;
DROP POLICY IF EXISTS "Users can create own workflow executions" ON workflow_executions;
DROP POLICY IF EXISTS "Users can update own workflow executions" ON workflow_executions;

CREATE POLICY "Users can view own workflow executions"
  ON workflow_executions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own workflow executions"
  ON workflow_executions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own workflow executions"
  ON workflow_executions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Research queries table policies
DROP POLICY IF EXISTS "Users can view own research queries" ON research_queries;
DROP POLICY IF EXISTS "Users can create own research queries" ON research_queries;

CREATE POLICY "Users can view own research queries"
  ON research_queries FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own research queries"
  ON research_queries FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Integrations table policies
DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;

CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
