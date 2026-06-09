const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

let callCount = 0;
const MAX_CALLS = 20;
const RESET_INTERVAL = 60000;

setInterval(() => { callCount = 0; }, RESET_INTERVAL);

export async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY || API_KEY === 'MY_GEMINI_API_KEY') {
    return '⚠️ Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env.local (get a free key at https://aistudio.google.com/apikey)';
  }

  callCount++;
  if (callCount > MAX_CALLS) {
    return '⚠️ Rate limit reached (20 calls/min). Please wait and try again.';
  }

  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return `⚠️ API error (${res.status}): ${err.slice(0, 200)}`;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return text;
  } catch (err: any) {
    return `⚠️ Network error: ${err?.message || 'Unknown error'}`;
  }
}

export const AI_PROMPTS = {
  explain: (code: string) =>
    `You are a senior developer. Explain the following code in simple terms. Break it down line-by-line or section-by-section. Include what it does, key patterns used, and any potential issues.

Code:
\`\`\`
${code}
\`\`\`

Format your response with:
## Overview
(1-2 sentences)

## Breakdown
(line-by-line or section explanation)

## Key Patterns
(what patterns/techniques are used)

## Potential Issues
(if any)`,

  docs: (code: string) =>
    `You are a technical writer. Generate comprehensive documentation for the following code. Include JSDoc-style comments for functions, a usage example, and parameter descriptions.

Code:
\`\`\`
${code}
\`\`\`

Format your response with:
## Summary
## API / Functions
## Usage Example
## Notes`,

  review: (code: string) =>
    `You are a senior code reviewer. Review the following code and identify bugs, security issues, performance problems, and style improvements. Be constructive.

Code:
\`\`\`
${code}
\`\`\`

Format your response with:
## Summary
## Bugs & Issues
## Security Concerns
## Performance
## Style & Best Practices
## Suggestions`,

  regex: (query: string) =>
    `You are a regex expert. Generate a regular expression for the following description. Explain what each part does.

Description: ${query}

Format your response with:
## Regex Pattern
## Explanation
## Test Examples
## Notes (flags, edge cases)`,
};
