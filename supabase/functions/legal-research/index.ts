import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { query, jurisdiction } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const jurisdictionContext = jurisdiction
      ? `Focus on ${jurisdiction} jurisdiction.`
      : 'Include relevant jurisdictions in your response.';

    const prompt = `You are a legal research assistant with access to case law databases.
A lawyer is researching: "${query}"

${jurisdictionContext}

Provide relevant legal authorities, cases, statutes, and regulations. For each result, include:
1. Title/Name of the authority
2. Full legal citation
3. Brief summary of relevance
4. Jurisdiction
5. Type (case_law, statute, regulation, treaty)

Format your response as a JSON array:
[
  {
    "title": "Case or statute name",
    "citation": "Full legal citation",
    "summary": "Brief explanation of relevance",
    "jurisdiction": "US/EU/UK/etc",
    "type": "case_law/statute/regulation/treaty",
    "relevance": 0.9
  }
]

Provide 5-8 highly relevant results. Be specific with citations.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") || "https://fultons.app",
        "X-Title": "Fultons Legal AI",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in legal-research function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});