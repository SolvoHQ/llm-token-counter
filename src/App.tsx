import { useState, useEffect, useCallback } from "react";
import { encodingForModel, type TiktokenModel } from "js-tiktoken";
import "./App.css";

type Model = {
  id: string;
  label: string;
  tiktokenId: TiktokenModel;
  pricePerMillion: number;
  approximate: boolean;
};

const MODELS: Model[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o",
    tiktokenId: "gpt-4o",
    pricePerMillion: 2.5,
    approximate: false,
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    tiktokenId: "gpt-3.5-turbo",
    pricePerMillion: 0.5,
    approximate: false,
  },
  {
    id: "claude-3-haiku",
    label: "Claude 3 Haiku",
    tiktokenId: "gpt-4" as TiktokenModel,
    pricePerMillion: 0.25,
    approximate: true,
  },
  {
    id: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    tiktokenId: "gpt-4" as TiktokenModel,
    pricePerMillion: 0.075,
    approximate: true,
  },
];

function countTokens(text: string, model: Model): number {
  if (!text) return 0;
  const enc = encodingForModel(model.tiktokenId);
  const tokens = enc.encode(text);
  return tokens.length;
}

function formatCost(count: number, pricePerMillion: number): string {
  const cost = (count / 1_000_000) * pricePerMillion;
  if (cost === 0) return "$0.000000";
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

export default function App() {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [tokenCount, setTokenCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    const count = countTokens(text, selectedModel);
    setTokenCount(count);
  }, [text, selectedModel]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleCopy = async () => {
    if (tokenCount === 0) return;
    await navigator.clipboard.writeText(String(tokenCount));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const cost = formatCost(tokenCount, selectedModel.pricePerMillion);
  const approx = selectedModel.approximate;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split("\n").length : 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>LLM Token Counter</h1>
        <p className="subtitle">Free, instant, client-side — your text never leaves the browser.</p>
      </header>

      <main className="app-main">
        <div className="model-row">
          <label htmlFor="model-select">Model</label>
          <select
            id="model-select"
            value={selectedModel.id}
            onChange={(e) => {
              const m = MODELS.find((m) => m.id === e.target.value)!;
              setSelectedModel(m);
            }}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}{m.approximate ? " (≈ estimated)" : ""}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your prompt, context, or any text here…"
          spellCheck={false}
          autoFocus
        />

        <div className="results-grid">
          <button
            className={`token-block${copied ? " copied" : ""}`}
            onClick={handleCopy}
            title="Click to copy token count"
          >
            <span className="big-number">
              {approx && tokenCount > 0 ? "≈ " : ""}
              {tokenCount.toLocaleString()}
            </span>
            <span className="block-label">
              {tokenCount === 1 ? "token" : "tokens"}
              {tokenCount > 0 ? (copied ? " · copied!" : " · click to copy") : ""}
            </span>
          </button>

          <div className="cost-block">
            <span className="big-number cost-number">
              {approx && tokenCount > 0 ? "≈ " : ""}{cost}
            </span>
            <span className="block-label">
              input cost · ${selectedModel.pricePerMillion}/1M tokens
            </span>
          </div>
        </div>

        {approx && tokenCount > 0 && (
          <p className="approx-note">
            * {selectedModel.label} uses a proprietary tokenizer. Count is estimated using
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
