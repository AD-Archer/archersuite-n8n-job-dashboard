import { NextRequest, NextResponse } from 'next/server';

// Use node runtime (Ollama/local calls won't work reliably on edge)
export const runtime = 'nodejs';

// Add a shared ChatMessage type for chat support
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function buildPrompt(body: any) {
  const { task, inputs } = body as {
    provider?: 'openai' | 'gemini' | 'openrouter' | 'ollama'
    task: 'qa' | 'resume' | 'coverLetter';
    inputs: {
      question?: string;
      jobTitle?: string;
      company?: string;
      jobDescription?: string;
      resumeText?: string;
      notes?: string;
      tone?: string;
      length?: 'short' | 'long';
    };
  };

  const base = `You are an expert career coach and recruiter. Use the provided info to produce high-quality, original, non-plagiarized content. Keep it ${inputs.length === 'short' ? 'concise (3-6 sentences or 2-4 bullets)' : 'comprehensive (6-12 sentences or 5-8 bullets)'} with a ${inputs.tone || 'professional'} tone. Avoid making up facts; use only the info given. If something is missing, state reasonable assumptions briefly.`;

  const context = [
    inputs.jobTitle ? `Job Title: ${inputs.jobTitle}` : '',
    inputs.company ? `Company: ${inputs.company}` : '',
    inputs.jobDescription ? `Job Description:\n${inputs.jobDescription}` : '',
    inputs.resumeText ? `Candidate Resume/Highlights:\n${inputs.resumeText}` : '',
    inputs.notes ? `Notes:\n${inputs.notes}` : ''
  ].filter(Boolean).join('\n\n');

  if (task === 'qa') {
    return `${base}\n\nTask: Provide an interview-style answer to the question. Emphasize alignment to the role and company, impact, and relevant examples.\n\nQuestion: ${inputs.question || 'N/A'}\n\nContext:\n${context}\n\nFormat as a coherent paragraph or short bullets.`;
  }
  if (task === 'resume') {
    return `${base}\n\nTask: Rewrite or improve resume bullets tailored to the role. Use strong action verbs, metrics, and impact. Return only the bullets.\n\nContext:\n${context}`;
  }
  // coverLetter
  return `${base}\n\nTask: Draft a tailored cover letter body (no header/signature). Focus on fit, achievements, and motivation.\n\nContext:\n${context}`;
}

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful, expert career coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI error: ${await resp.text()}`);
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

// New: OpenAI chat with messages
async function callOpenAIChat(messages: ChatMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });
  if (!resp.ok) throw new Error(`OpenAI error: ${await resp.text()}`);
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callOpenRouter(prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful, expert career coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!resp.ok) throw new Error(`OpenRouter error: ${await resp.text()}`);
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

// New: OpenRouter chat with messages
async function callOpenRouterChat(messages: ChatMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });
  if (!resp.ok) throw new Error(`OpenRouter error: ${await resp.text()}`);
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!resp.ok) throw new Error(`Gemini error: ${await resp.text()}`);
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p: any) => p.text).filter(Boolean).join('\n');
  return text || '';
}

// New: Gemini chat with messages
async function callGeminiChat(messages: ChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  // Map OpenAI-style messages to Gemini contents. Gemini expects roles 'user' and 'model'.
  // We'll convert 'system' to a 'user' message prefixed with 'SYSTEM: ' for guidance.
  const contents = messages.map((m) => {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const text = m.role === 'system' ? `SYSTEM: ${m.content}` : m.content;
    return { role, parts: [{ text }] };
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.7 } }),
  });
  if (!resp.ok) throw new Error(`Gemini error: ${await resp.text()}`);
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p: any) => p.text).filter(Boolean).join('\n');
  return text || '';
}

async function callOllama(prompt: string) {
  const base = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.1';
  const resp = await fetch(`${base.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful, expert career coach.' },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: { temperature: 0.7 },
    }),
  });
  if (!resp.ok) throw new Error(`Ollama error: ${await resp.text()}`);
  const data = await resp.json();
  return data?.message?.content || '';
}

// New: Ollama chat with messages
async function callOllamaChat(messages: ChatMessage[]) {
  const base = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.1';
  const resp = await fetch(`${base.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, options: { temperature: 0.7 } }),
  });
  if (!resp.ok) throw new Error(`Ollama error: ${await resp.text()}`);
  const data = await resp.json();
  return data?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = (body?.provider || 'openai') as 'openai' | 'gemini' | 'openrouter' | 'ollama';

    // New: if chat messages are provided, run a chat completion
    const messages = body?.messages as ChatMessage[] | undefined;
    if (Array.isArray(messages) && messages.length > 0) {
      let output = '';
      if (provider === 'openai') output = await callOpenAIChat(messages);
      else if (provider === 'gemini') output = await callGeminiChat(messages);
      else if (provider === 'openrouter') output = await callOpenRouterChat(messages);
      else if (provider === 'ollama') output = await callOllamaChat(messages);
      else throw new Error('Unsupported provider');
      return NextResponse.json({ output });
    }

    // Fallback to legacy prompt-based flow using task + inputs
    const prompt = buildPrompt(body);

    let output = '';
    if (provider === 'openai') output = await callOpenAI(prompt);
    else if (provider === 'gemini') output = await callGemini(prompt);
    else if (provider === 'openrouter') output = await callOpenRouter(prompt);
    else if (provider === 'ollama') output = await callOllama(prompt);
    else throw new Error('Unsupported provider');

    return NextResponse.json({ output });
  } catch (e: any) {
    console.error('AI route error', e);
    return NextResponse.json({ error: e?.message || 'Unexpected server error' }, { status: 500 });
  }
}
