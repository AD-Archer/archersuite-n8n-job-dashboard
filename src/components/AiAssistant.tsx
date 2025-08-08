"use client";

import { useState, useEffect } from "react";

type Task = "qa" | "resume" | "coverLetter";

type Length = "short" | "long";

type Tone = "professional" | "enthusiastic" | "concise" | "friendly";

type Provider = "openai" | "gemini" | "openrouter" | "ollama";

export default function AiAssistant() {
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

  // Prefill from URL query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const jt = params.get('jobTitle');
    const co = params.get('company');
    const jd = params.get('jobDescription');
    if (jt) setJobTitle(jt);
    if (co) setCompany(co);
    if (jd) setJobDescription(jd);
  }, []);

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

  function Header() {
    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">AI Assistant</h3>
        <p className="text-sm text-gray-600">Answer interview questions, improve resume bullets, and generate tailored cover letters.</p>
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
            <input className="w-full border rounded-lg px-3 py-2 bg-white" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Job Question (for Q&amp;A)</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-white" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Why do you want this job?" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Job Description (optional but recommended)</label>
          <textarea className="w-full min-h-28 border rounded-lg px-3 py-2 bg-white" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Resume or Highlights</label>
          <textarea className="w-full min-h-28 border rounded-lg px-3 py-2 bg-white" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text or key bullets..." />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Notes (focus areas, constraints)</label>
          <textarea className="w-full min-h-20 border rounded-lg px-3 py-2 bg-white" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., 5 years in React, looking for remote roles..." />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
      <Header />
      <TaskTabs />
      <Controls />
      <form onSubmit={onSubmit} className="space-y-4">
        <FormFields />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`px-4 py-2.5 rounded-xl text-white font-medium shadow ${
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

      {output && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800">Result</h4>
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
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
