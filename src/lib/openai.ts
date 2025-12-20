import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': window.location.origin,
    'X-Title': 'My Bolt App',
  }
});

export async function getAIResponse(prompt: string, model: string = "google/gemini-2.0-flash-exp:free") {
  const completion = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}

export async function getDeepSeekResponse(prompt: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "deepseek/deepseek-r1-0528:free",
      "messages": [{ "role": "user", "content": prompt }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function legalTaskRunner(
  taskType: 'research' | 'summary' | 'extraction' | 'reasoning',
  content: string
) {
  const configs = {
    research: {
      model: 'anthropic/claude-3.5-sonnet',
      prompt: `Act as a senior partner at a top-tier law firm. Provide high-quality legal prose and a "lawyer-like" authoritative tone for: ${content}`
    },
    summary: {
      model: 'google/gemini-flash-1.5',
      prompt: `Analyze this massive document and match it against our internal policy guidelines. Provide a high-level executive summary: ${content}`
    },
    extraction: {
      model: 'mistralai/mistral-small',
      prompt: `You are a data extraction bot. Extract all names, dates, and amounts from this text into a JSON format: ${content}`
    },
    reasoning: {
      model: 'deepseek/deepseek-r1',
      prompt: `Perform a deep legal analysis on this clause. Think through the implications for both parties: ${content}`
    }
  };

  const selected = configs[taskType];

  return await openai.chat.completions.create({
    model: selected.model,
    messages: [{ role: 'user', content: selected.prompt }],
    ...(taskType === 'reasoning' && { include_reasoning: true })
  });
}
