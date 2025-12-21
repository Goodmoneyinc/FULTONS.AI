import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface OAuthCallbackRequest {
  provider: 'google_drive' | 'sharepoint' | 'imanage' | 'netdocuments';
  code: string;
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { provider, code, userId }: OAuthCallbackRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let accessToken = '';
    let refreshToken = '';
    let expiresIn = 0;
    let providerUserId = '';
    let providerEmail = '';

    if (provider === 'google_drive') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

      if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Google OAuth credentials not configured');
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      expiresIn = tokenData.expires_in;

      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        providerUserId = userInfo.id;
        providerEmail = userInfo.email;
      }
    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not yet implemented` }),
        {
          status: 501,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { data, error } = await supabase
      .from('integrations')
      .upsert(
        {
          user_id: userId,
          provider,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt,
          provider_user_id: providerUserId,
          provider_email: providerEmail,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, integration: data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});