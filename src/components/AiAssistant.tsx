"use client";

// Debugging re-renders
console.log("AiAssistant component rendered");

import { useState, useEffect, useMemo, useRef, memo } from "react";

type Task = "qa" | "resume" | "coverLetter" | "chat";

type Length = "short" | "long";

type Tone = "professional" | "enthusiastic" | "concise" | "friendly";

type Provider = "openai" | "gemini" | "openrouter" | "ollama";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export default function AiAssistant() {
  // Remove excessive render logging - use React DevTools instead
  
  const [task, setTask] = useState<Task>("qa");
  const [provider, setProvider] = useState<Provider>("openai");
  const [question, setQuestion] = useState("Why do you want this job?");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("short");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const didPrefillRef = useRef(false);

  // Import resume JSON state (lifted to top-level)
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportResume = async () => {
    setImporting(true);
    setImportError(null);
    try {
      const res = await fetch(importUrl);
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data = await res.json();
      const newResumeText = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      setResumeText(newResumeText);
    } catch (e: any) {
      setImportError(e.message || 'Failed to import resume');
    } finally {
      setImporting(false);
    }
  };

  // Prefill from URL query params and restore soft settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const jt = params.get('jobTitle');
    const co = params.get('company');
    const jd = params.get('jobDescription');
    
    if (jt) setJobTitle(jt);
    if (co) setCompany(co);
    if (jd) setJobDescription(jd);

    // Restore soft settings (only on first load)
    if (!didPrefillRef.current) {
      didPrefillRef.current = true;
      try {
        const savedProvider = window.localStorage.getItem('aiProvider');
        const savedTone = window.localStorage.getItem('aiTone');
        const savedLength = window.localStorage.getItem('aiLength');
        
        if (savedProvider === 'openai' || savedProvider === 'gemini' || savedProvider === 'openrouter' || savedProvider === 'ollama') {
          setProvider(savedProvider);
        }
        if (savedTone === 'professional' || savedTone === 'enthusiastic' || savedTone === 'concise' || savedTone === 'friendly') {
          setTone(savedTone as Tone);
        }
        if (savedLength === 'short' || savedLength === 'long') {
          setLength(savedLength as Length);
        }
      } catch {}
    }
  }, []);

  // Persist user changes to localStorage (only when they actually change)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('aiProvider', provider);
    } catch {}
  }, [provider]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('aiTone', tone);
    } catch {}
  }, [tone]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('aiLength', length);
    } catch {}
  }, [length]);

  // Re-enable auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Build base system/context messages for chat using current fields - RESTORED useMemo
  const baseChatMessages = useMemo<ChatMessage[]>(() => {
    const contextLines = [
      jobTitle ? `Job Title: ${jobTitle}` : '',
      company ? `Company: ${company}` : '',
      jobDescription ? `Job Description:\n${jobDescription}` : '',
      resumeText ? `Candidate Resume/Highlights:\n${resumeText}` : '',
      notes ? `Notes:\n${notes}` : ''
    ].filter(Boolean).join('\n\n');

    const system: ChatMessage = {
      role: 'system',
      content: `You are an expert career coach and recruiter. Maintain a ${tone} tone and keep responses ${length === 'short' ? 'concise' : 'comprehensive'}. Avoid fabrications. If the user pastes an updated resume or cover letter, help revise and iterate with specific, actionable edits.`
    };

    const contextMsg: ChatMessage | null = contextLines
      ? { role: 'user', content: `Context for future turns:\n\n${contextLines}` }
      : null;

    return contextMsg ? [system, contextMsg] : [system];
  }, [jobTitle, company, jobDescription, resumeText, notes, tone, length]);

  const canSubmit = (() => {
    if (task === "qa") return !!question.trim();
    if (task === "resume") return !!resumeText.trim();
    if (task === "coverLetter") return !!(resumeText.trim() || jobDescription.trim());
    return false;
  })();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          task,
          inputs: {
            question,
            jobTitle,
            company,
            jobDescription,
            resumeText,
            notes,
            tone,
            length,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setOutput(data.output || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function sendChatMessage() {
    const content = chatInput.trim();
    if (!content || chatLoading) return;
    setChatLoading(true);
    setChatError(null);
    const nextMessages = [...chatMessages, { role: 'user' as const, content }];
    setChatMessages(nextMessages);
    setChatInput("");
    try {
      const payload = { provider, messages: [...baseChatMessages, ...nextMessages] };
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const assistantReply = (data?.output as string) || '';
      setChatMessages(prev => [...prev, { role: 'assistant', content: assistantReply }]);
    } catch (err: any) {
      setChatError(err.message || 'Something went wrong');
    } finally {
      setChatLoading(false);
    }
  }

  function resetChat() {
    setChatMessages([]);
    setChatInput("");
    setChatError(null);
  }

  function Header() {
    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">AI Assistant</h3>
        <p className="text-sm text-gray-600">Answer interview questions, improve resume bullets, generate tailored cover letters, or iterate in chat like GPT.</p>
      </div>
    );
  }

  function TaskTabs() {
    const tabClass = (active: boolean) =>
      `flex-1 px-3 sm:px-5 py-2 sm:py-3 rounded-xl text-sm font-medium transition-all ${
        active ? "bg-white text-black-900 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-gray/50"
      }`;
    return (
      <div className="flex bg-gray-100/60 backdrop-blur-sm p-1 rounded-2xl border border-blue-400/20 shadow mb-4">
        <button className={tabClass(task === "qa")} onClick={() => setTask("qa")}>Q&amp;A</button>
        <button className={tabClass(task === "resume")} onClick={() => setTask("resume")}>Resume</button>
        <button className={tabClass(task === "coverLetter")} onClick={() => setTask("coverLetter")}>Cover Letter</button>
        <button className={tabClass(task === "chat")} onClick={() => setTask("chat")}>Chat</button>
      </div>
    );
  }

  function Controls() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-20">Provider</label>
          <select className="w-full border rounded-lg px-3 py-2 bg-white" value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="openrouter">OpenRouter</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-20">Tone</label>
          <select className="w-full border rounded-lg px-3 py-2 bg-white" value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
            <option value="professional">Professional</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="concise">Concise</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-20">Length</label>
          <select className="w-full border rounded-lg px-3 py-2 bg-white" value={length} onChange={(e) => setLength(e.target.value as Length)}>
            <option value="short">Short</option>
            <option value="long">Long</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-20">Company</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-white" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Vercel" />
        </div>
      </div>
    );
  }

  function FormFields() {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Job Title</label>
            <input 
              className="w-full border rounded-lg px-3 py-2 bg-white" 
              value={jobTitle} 
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Engineer" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Job Question (for Q&amp;A)</label>
            <input 
              className="w-full border rounded-lg px-3 py-2 bg-white" 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Why do you want this job?" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Job Description (optional but recommended)</label>
          <textarea
            className="w-full min-h-28 border rounded-lg px-3 py-2 bg-white"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
          />
        </div>

        {/* Import Resume as JSON from endpoint */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Import Resume from Endpoint (JSON)</label>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 bg-white"
              type="url"
              placeholder="https://example.com/api/resume.json"
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              disabled={importing}
            />
            <button
              type="button"
              className={`px-3 py-2 rounded-lg text-white font-medium shadow ${importing || !importUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={handleImportResume}
              disabled={importing || !importUrl}
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
          {importError && <div className="text-xs text-red-600">{importError}</div>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Resume or Highlights</label>
          <textarea
            className="w-full min-h-28 border rounded-lg px-3 py-2 bg-white"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text or key bullets..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Notes (focus areas, constraints)</label>
          <textarea 
            className="w-full min-h-20 border rounded-lg px-3 py-2 bg-white" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., 5 years in React, looking for remote roles..." 
          />
        </div>
      </div>
    );
  }

  function ChatUI() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">Chat uses your current context (tone/length and any job/resume fields). Update fields above and click Reset to re-seed.</p>
          <button type="button" onClick={resetChat} className="text-xs text-blue-600 hover:underline">Reset chat</button>
        </div>
        <div className="h-64 sm:h-80 overflow-y-auto border rounded-2xl bg-white p-3 space-y-3 flex flex-col">
          {/* Base context preview on first load */}
          {chatMessages.length === 0 && (
            <div className="text-xs text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-2">
              Context loaded. Start chatting to revise resumes or cover letters, ask follow-ups, or paste updated text for iterative edits.
            </div>
          )}
          {chatMessages.map((m, idx) => (
            <div key={idx} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-900'}`}>
              {m.content}
            </div>
          ))}
          {chatLoading && (
            <div className="text-xs text-gray-500">Thinking…</div>
          )}
          {/* Chat input appears below the most recent response */}
          <div ref={chatEndRef} />
          <div className="flex gap-2 mt-2">
            <textarea
              className="flex-1 border rounded-xl px-3 py-2 bg-white min-h-12 max-h-40 resize-y"
              placeholder="Type a message, paste your updated resume/cover letter, or ask for revisions…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
            />
            <button
              type="button"
              onClick={sendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              className={`px-4 py-2.5 rounded-xl text-white font-medium shadow ${chatLoading || !chatInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Send
            </button>
          </div>
        </div>
        {chatError && <span className="text-sm text-red-600">{chatError}</span>}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 relative z-50">
      <Header />
      <TaskTabs />
      <Controls />
      {task === 'chat' ? (
        <ChatUI />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <FormFields />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`px-4 py-2.5 rounded-xl text-white font-medium shadow pointer-events-auto ${
                loading || !canSubmit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Generating..." : task === "qa" ? "Generate Answer" : task === "resume" ? "Improve Resume" : "Generate Cover Letter"}
            </button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </form>
      )}

      {output && task !== 'chat' && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800">Result</h4>
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline pointer-events-auto"
              onClick={() => navigator.clipboard.writeText(output)}
            >
              Copy
            </button>
          </div>
          <div className="whitespace-pre-wrap bg-white border rounded-2xl p-4 text-sm text-gray-900">{output}</div>
        </div>
      )}
    </div>
  );
}
