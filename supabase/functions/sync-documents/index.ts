import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SyncRequest {
  integrationId: string;
  folderId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { integrationId, folderId }: SyncRequest = await req.json();

    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', user.id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    const syncedDocuments = [];

    if (integration.provider === 'google_drive') {
      const query = folderId
        ? `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder'`
        : "mimeType!='application/vnd.google-apps.folder'";

      const filesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime)&pageSize=100`,
        {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        }
      );

      if (!filesResponse.ok) {
        if (filesResponse.status === 401) {
          await supabase
            .from('integrations')
            .update({ status: 'expired' })
            .eq('id', integrationId);
          throw new Error('Access token expired');
        }
        throw new Error('Failed to fetch files from Google Drive');
      }

      const filesData = await filesResponse.json();
      const files = filesData.files || [];

      for (const file of files) {
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id')
          .eq('file_path', `google_drive:${file.id}`)
          .eq('owner_id', user.id)
          .single();

        if (!existingDoc) {
          const { data: newDoc, error: docError } = await supabase
            .from('documents')
            .insert({
              owner_id: user.id,
              filename: file.name,
              file_path: `google_drive:${file.id}`,
              file_size: parseInt(file.size || '0'),
              status: 'uploaded',
              upload_date: new Date(file.createdTime).toISOString(),
            })
            .select()
            .single();

          if (!docError && newDoc) {
            syncedDocuments.push(newDoc);
          }
        }
      }

      await supabase
        .from('integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', integrationId);
    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${integration.provider} not yet implemented` }),
        {
          status: 501,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount: syncedDocuments.length,
        documents: syncedDocuments,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Document sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});