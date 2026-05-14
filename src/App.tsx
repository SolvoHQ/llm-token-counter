import { useState, useMemo } from "react";
import { encodingForModel, type TiktokenModel } from "js-tiktoken";
import "./App.css";

type Model = {
  id: string;
  label: string;
  provider: string;
  tiktokenId: TiktokenModel;
  pricePerMillion: number;
  approximate: boolean;
};

const MODELS: Model[] = [
  { id: "gpt-4o",            label: "GPT-4o",            provider: "OpenAI",    tiktokenId: "gpt-4o",          pricePerMillion: 2.50,  approximate: false },
  { id: "gpt-4o-mini",       label: "GPT-4o mini",       provider: "OpenAI",    tiktokenId: "gpt-4o",          pricePerMillion: 0.15,  approximate: false },
  { id: "gpt-4.1",           label: "GPT-4.1",           provider: "OpenAI",    tiktokenId: "gpt-4o",          pricePerMillion: 2.00,  approximate: false },
  { id: "o1",                label: "o1",                provider: "OpenAI",    tiktokenId: "gpt-4o",          pricePerMillion: 15.00, approximate: false },
  { id: "o3-mini",           label: "o3-mini",           provider: "OpenAI",    tiktokenId: "gpt-4o",          pricePerMillion: 1.10,  approximate: false },
  { id: "gpt-3.5-turbo",     label: "GPT-3.5 Turbo",     provider: "OpenAI",    tiktokenId: "gpt-3.5-turbo",   pricePerMillion: 0.50,  approximate: false },
  { id: "claude-3.7-sonnet", label: "Claude 3.7 Sonnet", provider: "Anthropic", tiktokenId: "gpt-4" as TiktokenModel, pricePerMillion: 3.00,  approximate: true  },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic", tiktokenId: "gpt-4" as TiktokenModel, pricePerMillion: 3.00,  approximate: true  },
  { id: "claude-3-haiku",    label: "Claude 3 Haiku",    provider: "Anthropic", tiktokenId: "gpt-4" as TiktokenModel, pricePerMillion: 0.25,  approximate: true  },
  { id: "claude-3-opus",     label: "Claude 3 Opus",     provider: "Anthropic", tiktokenId: "gpt-4" as TiktokenModel, pricePerMillion: 15.00, approximate: true  },
  { id: "gemini-2.0-flash",  label: "Gemini 2.0 Flash",  provider: "Google",    tiktokenId: "gpt-4" as TiktokenModel, pricePerMillion: 0.10,  approximate: true  },
  { id: "gemini-1.5-pro",    label: "Gemini 1.5 Pro",    provider: "Google",    tiktokenId: "gpt-4" as TiktokenModel, pricePerMillion: 1.25,  approximate: true  },
];

const SAMPLE_TEXT =
  "You are a helpful assistant. The user has asked you to summarize the following article and identify the three most important takeaways. Please be concise and use bullet points where appropriate.";

function countTokens(text: string, model: Model): number {
  if (!text) return 0;
  try {
    const enc = encodingForModel(model.tiktokenId);
    return enc.encode(text).length;
  } catch {
    return -1;
  }
}

function formatCost(count: number, pricePerMillion: number): string {
  const cost = (count / 1_000_000) * pricePerMillion;
  if (cost === 0) return "$0.000000";
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

export default function App() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return [...MODELS]
      .sort((a, b) => a.pricePerMillion - b.pricePerMillion)
      .map((model) => {
        const tokenCount = countTokens(text, model);
        return { model, tokenCount, cost: formatCost(tokenCount, model.pricePerMillion) };
      });
  }, [text]);

  const cheapestId = rows.length > 0 ? rows[0].model.id : null;

  const handleCopyTokens = async (modelId: string, tokenCount: number) => {
    if (tokenCount === 0) return;
    await navigator.clipboard.writeText(String(tokenCount));
    setCopiedId(modelId);
    setTimeout(() => setCopiedId((prev) => (prev === modelId ? null : prev)), 1500);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split("\n").length : 0;
  const hasApprox = rows.some((r) => r.model.approximate && r.tokenCount > 0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>LLM Token Counter</h1>
        <p className="subtitle">Free, instant, client-side — your text never leaves the browser.</p>
      </header>

      <main className="app-main">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your prompt, context, or any text here…"
          spellCheck={false}
          autoFocus
        />

        <div className="table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Tokens</th>
              <th>Cost</th>
              <th>Exact/Approx</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ model, tokenCount, cost }) => {
              const isCheapest = model.id === cheapestId;
              const isCopied = copiedId === model.id;
              return (
                <tr key={model.id} className={isCheapest ? "cheapest-row" : undefined}>
                  <td>{model.label}</td>
                  <td className="provider">{model.provider}</td>
                  <td
                    className={`num token-cell${isCopied ? " copied" : ""}${tokenCount === -1 ? " err" : ""}`}
                    onClick={() => tokenCount > 0 && handleCopyTokens(model.id, tokenCount)}
                    title={tokenCount === -1 ? "Tokenizer failed to load" : "Click to copy token count"}
                  >
                    {tokenCount === -1
                      ? "err"
                      : <>
                          {model.approximate && tokenCount > 0 ? "≈ " : ""}
                          {tokenCount.toLocaleString()}
                          {tokenCount > 0 ? (isCopied ? " · copied!" : " · copy") : ""}
                        </>
                    }
                  </td>
                  <td className="num">{cost}</td>
                  <td className="approx-tag">{model.approximate ? "≈ Est." : "Exact"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {hasApprox && (
          <p className="approx-note">
            * Models marked "≈ Est." use a proprietary tokenizer. Count is estimated using
            OpenAI's cl100k_base — accuracy is within ~5% for English text.
          </p>
        )}

        {text.length > 0 && (
          <div className="stats-row">
            <span>{text.length.toLocaleString()} chars</span>
            <span className="sep">·</span>
            <span>{wordCount.toLocaleString()} words</span>
            <span className="sep">·</span>
            <span>{lineCount.toLocaleString()} {lineCount === 1 ? "line" : "lines"}</span>
          </div>
        )}
      </main>

      <footer className="app-footer">
        Prices as of May 2026{" "}
        <span className="sep">·</span>{" "}
        <a
          href="https://github.com/SolvoHQ/llm-token-counter"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source on GitHub
        </a>
        <span className="sep">·</span>{" "}
        Made by{" "}
        <a href="https://solvo.dev" target="_blank" rel="noopener noreferrer">
          Solvo
        </a>
      </footer>
    </div>
  );
}
