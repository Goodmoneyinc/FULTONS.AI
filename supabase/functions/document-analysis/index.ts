import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { documentId, taskType, query } = await req.json();

    if (!documentId || !taskType) {
      return new Response(
        JSON.stringify({ error: "documentId and taskType are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: contentData, error: contentError } = await supabase
      .from('document_contents')
      .select('content_text, page_count, character_count')
      .eq('document_id', documentId)
      .maybeSingle();

    if (contentError || !contentData) {
      throw new Error('Document content not found');
    }

    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterApiKey) {
      throw new Error("API key not configured");
    }

    let model = 'anthropic/claude-3.5-sonnet';
    let prompt = '';

    const isLargeDocument = contentData.character_count > 50000;

    switch (taskType) {
      case 'summarize':
        model = isLargeDocument ? 'google/gemini-flash-1.5' : 'anthropic/claude-3.5-sonnet';
        prompt = `You are a legal document summarization expert. Analyze this entire document and provide a comprehensive executive summary.

Document Text:
${contentData.content_text}

Provide:
1. Executive Summary (2-3 paragraphs)
2. Key Parties Identified
3. Main Terms and Conditions
4. Critical Dates and Deadlines
5. Financial Terms
6. Notable Clauses or Provisions

CITATION REQUIREMENT: For each key point, include a citation in the format [Page X] where the information appears in the document.`;
        break;

      case 'extract':
        model = 'mistralai/mistral-small';
        prompt = `Extract structured data from this legal document. Return ONLY valid JSON.

Document Text:
${contentData.content_text}

Extract into this JSON format:
{
  "parties": [{ "name": "", "role": "", "citation": "Page X" }],
  "dates": [{ "date": "", "significance": "", "citation": "Page X" }],
  "amounts": [{ "amount": "", "currency": "", "description": "", "citation": "Page X" }],
  "obligations": [{ "party": "", "obligation": "", "deadline": "", "citation": "Page X" }]
}`;
        break;

      case 'question':
        model = 'anthropic/claude-3.5-sonnet';
        if (!query) {
          throw new Error('Query is required for question taskType');
        }
        prompt = `You are a legal research assistant. Answer the following question based ONLY on the provided document.

Document Text:
${contentData.content_text}

Question: ${query}

IMPORTANT:
1. Only use information from the document provided
2. Cite specific sections using [Page X] format
3. If the answer is not in the document, state that clearly
4. Provide direct quotes where relevant
5. Be precise and avoid hallucinations`;
        break;

      case 'draft':
        model = 'anthropic/claude-3.5-sonnet';
        prompt = `You are a senior partner at a top law firm. Based on this reference document, draft a professional legal response or clause.

Reference Document:
${contentData.content_text}

Task: ${query || 'Draft a professional legal clause based on this document'}

Provide high-quality, lawyer-like prose that is precise, authoritative, and professionally formatted. Include citations to the reference document where appropriate using [Page X] format.`;
        break;

      default:
        throw new Error('Invalid taskType');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") || "https://fultons.app",
        "X-Title": "Fultons Legal AI",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        content,
        model,
        documentStats: {
          pageCount: contentData.page_count,
          characterCount: contentData.character_count,
          isLargeDocument
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in document-analysis function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});