# LLM Token Counter

**Free, instant, private.** Count tokens and estimate API costs across 18 LLM models — entirely in your browser. Your text never leaves your machine.

**[→ Try it live: llmtokens.vercel.app](https://llmtokens.vercel.app)**

---

## What it does

Paste any prompt or context and instantly get:

- **Exact token count** for all OpenAI models (uses the same `tiktoken` library OpenAI uses)
- **~5% approximate count** for Claude and Gemini (providers don't publish tokenizers)
- **Cost estimate** at current API input pricing
- **All 18 models at once** in the Comparison tab, sorted cheapest-first

## Demo

```
Paste any text...

┌──────────────────────────┬────────┬────────────┬──────────────────────┐
│ Model                    │ Tokens │ $/1M input │ Cost for this text   │
├──────────────────────────┼────────┼────────────┼──────────────────────┤
│ Gemini 2.0 Flash         │ ~47    │ $0.10      │ $0.000005            │
│ GPT-4o mini              │  47    │ $0.15      │ $0.000007            │
│ Gemini 2.5 Flash         │ ~47    │ $0.30      │ $0.000014            │
│ GPT-4.1                  │  47    │ $2.00      │ $0.000094            │
│ GPT-4o                   │  47    │ $2.50      │ $0.000118            │
│ Claude Sonnet 4.6        │ ~47    │ $3.00      │ $0.000141            │
│ Claude Opus 4.7          │ ~47    │ $5.00      │ $0.000235            │
│ o1                       │  47    │ $15.00     │ $0.000706            │
└──────────────────────────┴────────┴────────────┴──────────────────────┘
                                                  ↑ cheapest highlighted
```

## Supported models

| Provider | Accuracy | Models |
|----------|----------|--------|
| **OpenAI** | Exact | GPT-4o, GPT-4o mini, GPT-4.1, o1, o3, o3-mini, GPT-3.5 Turbo |
| **Anthropic** | ~5% | Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5, Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus |
| **Google** | ~5% | Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.0 Flash, Gemini 1.5 Pro |

## Token accuracy

- **OpenAI**: exact count using `js-tiktoken` (WASM port of the official tiktoken library)
- **Anthropic / Google**: ~5% approximation using the GPT-4 tokenizer as a proxy — these providers don't publish their tokenizers. Accurate enough for cost budgeting and prompt sizing decisions.

## No install needed

Open [llmtokens.vercel.app](https://llmtokens.vercel.app) in any browser. Works on mobile.

To run locally:

```bash
git clone https://github.com/SolvoHQ/llm-token-counter
cd llm-token-counter
npm install && npm run dev
# → http://localhost:5173
```

## Features

- **Counter tab** — pick one model, see token count + cost
- **Comparison tab** — all 18 models ranked cheapest-first, cheapest highlighted
- **Copy link** — share your exact prompt as a URL (text + model encoded in URL hash, nothing sent to any server)
- **Privacy by design** — pure client-side WASM, zero network requests for tokenization

## Stack

- React + TypeScript + Vite
- [`js-tiktoken`](https://github.com/dqbd/tiktoken) — WASM tokenizer, 100% client-side
- No backend · No analytics · No cookies

---

## ⭐ Star this repo if it saved you time

[![GitHub stars](https://img.shields.io/github/stars/SolvoHQ/llm-token-counter?style=social)](https://github.com/SolvoHQ/llm-token-counter)

*Pricing data is manually maintained. Check each provider's pricing page for the latest rates.*
