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

    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', documentId);

    // Download the PDF from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('legal-documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Extract text from PDF
    const pdfData = await pdfParse(buffer);

    // Clean the extracted text
    let cleanedText = pdfData.text;
    
    // Remove excessive whitespace
    cleanedText = cleanedText.replace(/\s+/g, ' ');
    
    // Remove excessive newlines (more than 2 consecutive)
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace from start and end
    cleanedText = cleanedText.trim();

    // Remove common header/footer patterns (page numbers, etc.)
    const lines = cleanedText.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmedLine = line.trim();
      // Remove lines that are just page numbers
      if (/^\d+$/.test(trimmedLine)) return false;
      // Remove very short lines (likely headers/footers)
      if (trimmedLine.length < 3) return false;
      return true;
    });
    
    cleanedText = filteredLines.join('\n');

    const characterCount = cleanedText.length;
    const pageCount = pdfData.numpages;

    // Save cleaned text to document_contents table
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

    // Update document status to completed
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

    // Try to update document status to failed
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
