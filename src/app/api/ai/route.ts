import { NextRequest, NextResponse } from 'next/server';

// Use edge runtime for lower latency
export const runtime = 'edge';

// We support OpenAI-compatible providers via fetch to avoid bundling large SDKs
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function buildPrompt(body: any) {
  const { task, inputs } = body as {
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

  const base = `You are an expert career coach and recruiter. Use the provided info to produce high-quality, original, non-plagiarized content. Keep it ${inputs.length === 'short' ? 'concise (3-6 sentences or 2-4 bullets)':'comprehensive (6-12 sentences or 5-8 bullets)'} with a ${inputs.tone || 'professional'} tone. Avoid making up facts; use only the info given. If something is missing, state reasonable assumptions briefly.`;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const prompt = buildPrompt(body);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful, expert career coach.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
    }

    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content || '';

    return NextResponse.json({ output });
  } catch (e: any) {
    console.error('AI route error', e);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
