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
