import { supabase } from './supabase';

export interface Integration {
  id: string;
  user_id: string;
  provider: 'google_drive' | 'sharepoint' | 'imanage' | 'netdocuments';
  status: 'active' | 'expired' | 'error';
  last_sync_at: string | null;
  sync_enabled: boolean;
  provider_email: string | null;
  created_at: string;
  updated_at: string;
}

const GOOGLE_CLIENT_ID = '524622107835-1234567890abcdefghijklmnopqrstuv.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = `${window.location.origin}/oauth/callback`;
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email';

export async function getIntegrations(): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getIntegration(provider: string): Promise<Integration | null> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', provider)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function initiateGoogleDriveOAuth(): void {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_SCOPES);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', 'google_drive');

  window.location.href = authUrl.toString();
}

export async function handleOAuthCallback(code: string, provider: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-callback`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        code,
        userId: user.id,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete OAuth');
  }

  return response.json();
}

export async function syncDocuments(integrationId: string): Promise<{ syncedCount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-documents`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ integrationId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync documents');
  }

  return response.json();
}

export async function disconnectIntegration(integrationId: string): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', integrationId);

  if (error) throw error;
}

export async function toggleSyncEnabled(integrationId: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .update({ sync_enabled: enabled })
    .eq('id', integrationId);

  if (error) throw error;
}
