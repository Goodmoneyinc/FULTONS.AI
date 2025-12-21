/*
  # Add missing foreign key indexes

  1. New Indexes
    - Add index on workflow_executions.document_id for foreign key performance
    - Add index on workflow_executions.workflow_id for foreign key performance
    - Add index on workflows.created_by for foreign key performance

  2. Purpose
    - Improve query performance for foreign key lookups
    - Prevent slow joins and cascading deletes
    - Follow database best practices for foreign key indexing

  3. Notes
    - Uses IF NOT EXISTS to prevent errors on re-running
    - These indexes are critical for optimal query performance
*/

CREATE INDEX IF NOT EXISTS idx_workflow_executions_document_id ON workflow_executions(document_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
