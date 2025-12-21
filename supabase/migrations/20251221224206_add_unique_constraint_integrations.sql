/*
  # Add unique constraint to integrations table

  1. Changes
    - Add unique constraint on (user_id, provider) combination
    - This ensures users can only have one integration per provider
    - Prevents duplicate OAuth connections

  2. Notes
    - Uses DO block to check if constraint exists before adding
    - Prevents errors on re-running migration
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'integrations_user_id_provider_key'
  ) THEN
    ALTER TABLE integrations
    ADD CONSTRAINT integrations_user_id_provider_key UNIQUE (user_id, provider);
  END IF;
END $$;
