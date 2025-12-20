import { createClient } from 'npm:@supabase/supabase-js@2';
import pdfParse from 'npm:pdf-parse@1.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ProcessDocumentRequest {
  documentId: string;
  filePath: string;
}

function chunkText(text: string, maxChunkSize: number = 10000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split('\n\n');
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { documentId, filePath }: ProcessDocumentRequest = await req.json();

    if (!documentId || !filePath) {
      throw new Error('documentId and filePath are required');
    }

    await supabase
      .from('documents')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', documentId);

    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('legal-documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const pdfData = await pdfParse(buffer);

    let cleanedText = pdfData.text;
    
    cleanedText = cleanedText.replace(/\s+/g, ' ');
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
    cleanedText = cleanedText.trim();

    const lines = cleanedText.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmedLine = line.trim();
      if (/^\d+$/.test(trimmedLine)) return false;
      if (trimmedLine.length < 3) return false;
      return true;
    });
    
    cleanedText = filteredLines.join('\n');

    const characterCount = cleanedText.length;
    const pageCount = pdfData.numpages;

    const chunks = chunkText(cleanedText, 10000);
    const isLargeDocument = chunks.length > 5;

    const metadata = {
      totalChunks: chunks.length,
      isLargeDocument,
      processingNote: isLargeDocument 
        ? 'Large document detected. Use Gemini 1.5 Flash for analysis.'
        : 'Standard document size. Can use any model.'
    };

    const { error: insertError } = await supabase
      .from('document_contents')
      .insert({
        document_id: documentId,
        content_text: cleanedText,
        page_count: pageCount,
        character_count: characterCount,
      });

    if (insertError) {
      throw new Error(`Failed to save content: ${insertError.message}`);
    }

    await supabase
      .from('documents')
      .update({
        status: 'completed',
        processed_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document processed successfully',
        pageCount,
        characterCount,
        metadata,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing document:', error);

    try {
      const { documentId } = await req.json();
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('documents')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});