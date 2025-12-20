import { callLegalAssistant, analyzeContract } from './api';

export async function getAIResponse(prompt: string, model: string = "anthropic/claude-3.5-sonnet") {
  return await callLegalAssistant(prompt, model);
}

export async function getDeepSeekResponse(prompt: string) {
  const result = await analyzeContract(prompt, 'mna');
  return {
    content: result.content,
    reasoning: result.reasoning || null
  };
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

  if (taskType === 'reasoning') {
    const result = await analyzeContract(selected.prompt, 'mna');
    return {
      choices: [{
        message: {
          content: result.content,
          reasoning: result.reasoning
        }
      }]
    };
  }

  const response = await callLegalAssistant(selected.prompt, selected.model);
  return {
    choices: [{
      message: {
        content: response
      }
    }]
  };
}
