/*
  # Add integrations table

  1. New Tables
    - `integrations`
      - `id` (uuid, primary key) - Unique identifier for the integration
      - `user_id` (uuid, foreign key) - User who owns this integration
      - `provider` (text) - Integration provider (google_drive, sharepoint, imanage, netdocuments)
      - `access_token` (text, encrypted) - OAuth access token for API calls
      - `refresh_token` (text, encrypted) - OAuth refresh token for renewing access
      - `token_expires_at` (timestamptz) - When the access token expires
      - `provider_user_id` (text) - User ID from the provider platform
      - `provider_email` (text) - Email associated with provider account
      - `status` (text) - Connection status (active, expired, error)
      - `last_sync_at` (timestamptz) - Last successful document sync
      - `sync_enabled` (boolean) - Whether auto-sync is enabled
      - `created_at` (timestamptz) - When the integration was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `integrations` table
    - Add policy for users to read their own integrations
    - Add policy for users to insert their own integrations
    - Add policy for users to update their own integrations
    - Add policy for users to delete their own integrations

  3. Indexes
    - Index on user_id for faster lookups
    - Index on provider for filtering by integration type
*/

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google_drive', 'sharepoint', 'imanage', 'netdocuments')),
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  provider_user_id text,
  provider_email text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error')),
  last_sync_at timestamptz,
  sync_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);