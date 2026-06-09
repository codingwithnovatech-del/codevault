import { useState } from 'react';
import { Bot, Code, FileText, ShieldCheck, Regex, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { callGemini, AI_PROMPTS } from '../lib/ai';
import type { AIToolType, AIResponse } from '../types';
import { copyToClipboard } from '../lib/utils';

const tools: { id: AIToolType; icon: any; label: string; desc: string; placeholder: string }[] = [
  { id: 'explain', icon: Code, label: 'Code Explainer', desc: 'Paste code and get a plain-English explanation', placeholder: 'Paste your code here...' },
  { id: 'docs', icon: FileText, label: 'Doc Generator', desc: 'Generate JSDoc-style documentation from your code', placeholder: 'Paste code to document...' },
  { id: 'review', icon: ShieldCheck, label: 'Code Reviewer', desc: 'AI finds bugs, security issues & improvements', placeholder: 'Paste code for review...' },
  { id: 'regex', icon: Regex, label: 'Regex Generator', desc: 'Describe what you want to match, get the regex', placeholder: 'e.g. "find all email addresses in a string"' },
];

export default function AIToolsView() {
  const [activeTool, setActiveTool] = useState<AIToolType>('explain');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<AIResponse>({ content: '', loading: false });
  const [copied, setCopied] = useState(false);

  const currentTool = tools.find((t) => t.id === activeTool)!;

  async function handleSubmit() {
    if (!input.trim() || response.loading) return;
    setResponse({ content: '', loading: true });
    const prompt = activeTool === 'regex'
      ? AI_PROMPTS.regex(input.trim())
      : (AI_PROMPTS[activeTool] as (code: string) => string)(input.trim());
    const result = await callGemini(prompt);
    setResponse({ content: result, loading: false });
  }

  function handleCopy() {
    copyToClipboard(response.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatResponse(text: string): string {
    return text
      .replace(/## /g, '### ')
      .replace(/\`\`\`/g, '```');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Developer Tools
        </h1>
        <p className="text-xs text-on-surface-variant/70">Powered by Gemini AI — every developer's second brain</p>
      </div>

      {/* Tool selector */}
      <div className="flex gap-1.5 bg-surface-container-lowest/50 border border-outline-variant/30 rounded-xl p-1 overflow-x-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button key={tool.id} onClick={() => { setActiveTool(tool.id); setResponse({ content: '', loading: false }); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeTool === tool.id ? 'bg-surface-container shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Active tool description */}
      <p className="text-xs text-on-surface-variant/60 font-light -mt-4">{currentTool.desc}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-wider">Input</label>
            <span className="text-[10px] font-mono text-on-surface-variant/30">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentTool.placeholder}
            rows={12}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-xs font-mono text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/60 resize-none transition-all"
          />
          <button onClick={handleSubmit} disabled={!input.trim() || response.loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/10">
            {response.loading ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Generate</>
            )}
          </button>
        </div>

        {/* Output panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-wider">Output</label>
            {response.content && (
              <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/40 hover:text-primary transition-colors">
                {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
            )}
          </div>
          <div className="w-full min-h-[320px] bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-xs overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
            {response.loading ? (
              <div className="flex items-center justify-center h-64 space-x-2 text-on-surface-variant/40">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : response.content ? (
              <div className="prose prose-invert prose-xs max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatResponse(response.content)
                    .split('\n').map(line => {
                      if (line.startsWith('### ')) return `<h3 class="text-sm font-bold text-primary mt-4 mb-1">${line.slice(4)}</h3>`;
                      if (line.startsWith('```')) return `<pre class="bg-surface-container-high border border-outline-variant/20 rounded-lg p-3 my-2 text-[11px] overflow-x-auto font-mono">${line.slice(3, -3)}</pre>`;
                      if (line.trim() === '') return '<br/>';
                      if (line.startsWith('- ')) return `<li class="text-on-surface-variant/80 ml-4 list-disc">${line.slice(2)}</li>`;
                      if (line.match(/^\d+\. /)) return `<li class="text-on-surface-variant/80 ml-4 list-decimal">${line.replace(/^\d+\. /, '')}</li>`;
                      return `<span class="text-on-surface-variant/80">${line}</span><br/>`;
                    }).join('\n')
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant/30 space-y-2">
                <Bot className="h-8 w-8" />
                <p className="text-xs">AI response will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage note */}
      <p className="text-[10px] font-mono text-on-surface-variant/20 text-center">
        Responses are generated by Google Gemini AI. Verify important code before use. Limited to 20 calls/minute.
      </p>
    </div>
  );
}
