import { supabase } from './supabase';

const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL;
};

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };
};

export async function callLegalAssistant(prompt: string, model: string = 'anthropic/claude-3.5-sonnet') {
  const headers = await getAuthHeaders();
  const url = `${getSupabaseUrl()}/functions/v1/legal-assistant`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    throw new Error('Failed to get AI response');
  }

  const data = await response.json();
  return data.content;
}

export async function analyzeContract(prompt: string, analysisType: 'mna' | 'gdpr') {
  const headers = await getAuthHeaders();
  const url = `${getSupabaseUrl()}/functions/v1/contract-analysis`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, analysisType }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze contract');
  }

  const data = await response.json();
  return {
    content: data.content,
    reasoning: data.reasoning,
  };
}

export async function conductLegalResearch(query: string, jurisdiction?: string) {
  const headers = await getAuthHeaders();
  const url = `${getSupabaseUrl()}/functions/v1/legal-research`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, jurisdiction }),
  });

  if (!response.ok) {
    throw new Error('Failed to conduct research');
  }

  const data = await response.json();
  return data.content;
}

export async function executeWorkflow(prompt: string) {
  const headers = await getAuthHeaders();
  const url = `${getSupabaseUrl()}/functions/v1/workflow-execute`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute workflow');
  }

  const data = await response.json();
  return data.content;
}
