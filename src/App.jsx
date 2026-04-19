import { useState, useEffect } from "react";
import axios from "axios";

import ScoreRing       from "./components/ScoreRing";
import NavDropdown     from "./components/NavDropdown";
import ErrorToast      from "./components/ErrorToast";
import ProgressDrawer  from "./components/ProgressDrawer";
import EmptyState      from "./components/EmptyState";
import ResultsSkeleton from "./components/ResultsSkeleton";
import HighlightedText from "./components/HighlightedText";
import PracticeMode    from "./components/PracticeMode";

const API_URL    = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const HISTORY_KEY = "grammify_history";
const MAX_CHARS   = 2000;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? []; }
  catch { return []; }
}
function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-100))); }

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy corrected text"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "none", border: "1px solid #d8d0c4", borderRadius: 30,
        padding: "3px 12px", fontSize: 12, color: copied ? "#4caf7d" : "#9a8f80",
        borderColor: copied ? "#4caf7d" : "#d8d0c4",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 5.5L4 8L9.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="3" y="3" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 3V2a1 1 0 00-1-1H2a1 1 0 00-1 1v5a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [text, setText]               = useState("");
  const [mode, setMode]               = useState("grammar");
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [history, setHistory]         = useState(loadHistory);
  const [showProgress, setShowProgress] = useState(false);
  const [serverStatus, setServerStatus] = useState(null); // null | "ok" | "error"
  const [practiceMode, setPracticeMode] = useState(false);

  // ── Health check on mount — lets users know immediately if Flask is down
  useEffect(() => {
    axios.get(`${API_URL}/health`, { timeout: 4000 })
      .then(() => setServerStatus("ok"))
      .catch(() => setServerStatus("error"));
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (text.length > MAX_CHARS) {
      setError(`Text exceeds ${MAX_CHARS} characters. Please shorten it.`);
      return;
    }
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API_URL}/correct`, { text, mode });
      setResult(res.data);
      // Truncate stored text to 500 chars to keep localStorage usage bounded
      // (100 entries × 500 chars ≈ 50 KB — well within the 5 MB browser limit).
      const entry = {
        date: new Date().toISOString(),
        original:        text.slice(0, 500),
        corrected:       (res.data.corrected ?? "").slice(0, 500),
        error_type:      res.data.error_type,
        original_score:  res.data.original_score  ?? 70,
        corrected_score: res.data.corrected_score ?? 90,
        mode,
      };
      const updated = [...history, entry];
      setHistory(updated); saveHistory(updated);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400 && err.response.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot reach the server. Make sure Flask is running on port 5000.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally { setLoading(false); }
  };

  const clearHistory = () => { setHistory([]); localStorage.removeItem(HISTORY_KEY); };

  const hasChanges  = result?.changes?.length > 0;
  const isOverLimit = text.length > MAX_CHARS;
  const charColor   = isOverLimit
    ? "#e07070"
    : text.length > MAX_CHARS * 0.8 ? "#e8a840" : "#c8bfb0";

  // Detect platform for keyboard shortcut hint
  const isMac       = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform);
  const shortcutHint = isMac ? "⌘↵ to submit" : "Ctrl+↵ to submit";

  const modes    = [
    { value: "grammar",  label: "Grammar"  },
    { value: "formal",   label: "Formal"   },
    { value: "simplify", label: "Simplify" },
  ];
  const navItems = [
    { label: "About", items: [{ title: "Our mission", desc: "Why we built Grammify" }, { title: "How it works", desc: "T5 model + rule-based fixes" }, { title: "Open source", desc: "Built in public on GitHub" }] },
    { label: "Docs",  items: [{ title: "Quick start", desc: "Up in 2 minutes" },       { title: "API reference", desc: "POST /correct endpoint" },       { title: "Grammar modes", desc: "Grammar, Formal, Simplify" }] },
    { label: "Blog",  items: [{ title: "Why grammar matters", desc: "The science of clear writing" }, { title: "T5 vs GPT", desc: "Benchmarks & tradeoffs" }] },
  ];

  return (
    <>
      {/* ── APP SHELL ── */}
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f7f4ef" }}>

        {/* NAV */}
        <nav style={{
          flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 2rem", height: 56,
          borderBottom: "1px solid #e8e3da", background: "#f7f4ef",
          position: "relative", zIndex: 100,
        }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: 19, fontWeight: 500, color: "#1a1814", letterSpacing: "-0.02em" }}>
            Grammify
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {navItems.map(({ label, items }) => <NavDropdown key={label} label={label} items={items} />)}
            {/* Server status indicator */}
            {serverStatus === "error" && (
              <span title="Flask server is not reachable. Start it with: python app.py" style={{
                fontSize: 11, color: "#e07070", background: "#fddcdc",
                border: "1px solid #e07070", borderRadius: 20, padding: "3px 10px",
                cursor: "default",
              }}>
                ⚠️ Server offline
              </span>
            )}
            {serverStatus === "ok" && (
              <span title="Flask server is connected" style={{
                fontSize: 11, color: "#4caf7d", background: "#c8f0dc",
                border: "1px solid #4caf7d", borderRadius: 20, padding: "3px 10px",
                cursor: "default",
              }}>
                ● Connected
              </span>
            )}
            {/* Practice Mode toggle */}
            <button
              id="btn-practice-mode"
              onClick={() => setPracticeMode((p) => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 14px", fontSize: 13, fontWeight: 500,
                border: "1px solid",
                borderColor: practiceMode ? "#1a1814" : "#d8d0c4",
                borderRadius: 40,
                background: practiceMode ? "#1a1814" : "transparent",
                color: practiceMode ? "#f7f4ef" : "#9a8f80",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!practiceMode) { e.currentTarget.style.borderColor = "#1a1814"; e.currentTarget.style.color = "#1a1814"; } }}
              onMouseLeave={e => { if (!practiceMode) { e.currentTarget.style.borderColor = "#d8d0c4"; e.currentTarget.style.color = "#9a8f80"; } }}
            >
              {/* Pencil icon */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2L4 10H2v-2l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Practice
            </button>
            <button
              id="btn-progress"
              onClick={() => setShowProgress(true)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "6px 14px", fontSize: 13, fontWeight: 500,
                border: "1px solid #d8d0c4", borderRadius: 40,
                background: "transparent", color: "#9a8f80",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a1814"; e.currentTarget.style.color = "#1a1814"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d8d0c4"; e.currentTarget.style.color = "#9a8f80"; }}
            >
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="7" width="2.5" height="5" rx="1" fill="currentColor" />
                <rect x="5" y="4" width="2.5" height="8" rx="1" fill="currentColor" />
                <rect x="9" y="1" width="2.5" height="11" rx="1" fill="currentColor" />
              </svg>
              My Progress
              {history.length > 0 && (
                <span style={{ background: "#1a1814", color: "#f7f4ef", borderRadius: 10, fontSize: 10, fontWeight: 600, padding: "1px 6px" }}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* ── CONTENT AREA: Practice Mode OR normal two-panel ── */}
        {practiceMode ? (
          <div style={{ flex: 1, display: "flex", overflowY: "auto" }}>
            <PracticeMode onExit={() => setPracticeMode(false)} />
          </div>
        ) : (
          /* ── TWO-PANEL GRID ── */
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>

          {/* ── LEFT: INPUT PANEL ── */}
          <div style={{
            display: "flex", flexDirection: "column",
            padding: "2rem 2rem 2rem 2.5rem",
            borderRight: "1px solid #e8e3da", overflowY: "auto", gap: 20,
          }}>
            {/* Mini hero */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Writing assistant
              </p>
              <h1 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 400, color: "#1a1814", lineHeight: 1.2, letterSpacing: "-0.025em", marginBottom: 8 }}>
                Write better,{" "}
                <span style={{ fontStyle: "italic", color: "#6b5f4e" }}>every time.</span>
              </h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: "#9a8f80", lineHeight: 1.65 }}>
                Paste your sentence, pick a mode, and see instant corrections with a grammar score.
              </p>
            </div>

            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 4 }}>
              {modes.map(({ value, label }) => (
                <button
                  key={value}
                  id={`mode-${value}`}
                  onClick={() => setMode(value)}
                  style={{
                    padding: "6px 16px", fontSize: 13,
                    fontWeight: mode === value ? 500 : 400,
                    border: "1px solid", borderColor: mode === value ? "#1a1814" : "#d8d0c4",
                    borderRadius: 40,
                    background: mode === value ? "#1a1814" : "transparent",
                    color: mode === value ? "#f7f4ef" : "#9a8f80",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Textarea with char counter */}
            <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
              <textarea
                id="input-text"
                placeholder="Start typing or paste something to improve..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit(); }}
                style={{
                  flex: 1, minHeight: 180, width: "100%", padding: "16px 18px",
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                  lineHeight: 1.75, border: `1px solid ${isOverLimit ? "#e07070" : "#d8d0c4"}`,
                  borderRadius: 14, background: "#fdfaf6", color: "#1a1814",
                  resize: "none", outline: "none", transition: "border-color 0.2s",
                }}
              />
              <span style={{
                position: "absolute", bottom: 12, right: 14,
                fontSize: 11, color: charColor, pointerEvents: "none",
                transition: "color 0.2s",
              }}>
                {text.length}/{MAX_CHARS}
              </span>
            </div>

            {/* Submit row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                id="btn-submit"
                onClick={handleSubmit}
                disabled={loading || !text.trim() || isOverLimit}
                style={{
                  padding: "10px 28px", fontSize: 14, fontWeight: 500,
                  border: "1px solid #1a1814", borderRadius: 40,
                  background: loading || !text.trim() || isOverLimit ? "transparent" : "#1a1814",
                  color: loading || !text.trim() || isOverLimit ? "#b0a090" : "#f7f4ef",
                  cursor: loading || !text.trim() || isOverLimit ? "not-allowed" : "pointer",
                  transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 11, height: 11, border: "1.5px solid rgba(26,24,20,0.2)",
                      borderTopColor: "#1a1814", borderRadius: "50%",
                      display: "inline-block", animation: "spin 0.8s linear infinite",
                    }} />
                    Working…
                  </>
                ) : "Correct sentence →"}
              </button>

              {result && (
                <button
                  id="btn-clear"
                  onClick={() => setResult(null)}
                  style={{ background: "none", border: "none", fontSize: 12, color: "#b0a090", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#d8d0c4" }}
                >
                  Clear result
                </button>
              )}
              <span style={{ fontSize: 11, color: "#c8bfb0", marginLeft: "auto" }}>{shortcutHint}</span>
            </div>
          </div>

          {/* ── RIGHT: RESULTS PANEL ── */}
          <div style={{ overflowY: "auto", padding: "2rem 2.5rem 2rem 2rem" }}>
            {loading ? (
              <ResultsSkeleton />
            ) : !result ? (
              <EmptyState />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Score rings */}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
                    Grammar score
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 24,
                    background: "#fdfaf6", border: "1px solid #e8e3da",
                    borderRadius: 16, padding: "18px 24px", width: "fit-content",
                  }}>
                    <ScoreRing score={result.original_score ?? 70}  label="Before" />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <svg width="24" height="10" viewBox="0 0 24 10" fill="none">
                        <path d="M1 5h18M14 1l5 4-5 4" stroke="#c8bfb0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 10, color: "#c8bfb0" }}>
                        +{Math.max(0, (result.corrected_score ?? 90) - (result.original_score ?? 70))} pts
                      </span>
                    </div>
                    <ScoreRing score={result.corrected_score ?? 90} label="After" />
                  </div>
                </div>

                {/* Highlighted text — XSS-safe */}
                {hasChanges && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                      Your text (issues highlighted)
                    </p>
                    <HighlightedText text={text} changes={result.changes} />
                  </div>
                )}

                {/* What changed pills */}
                {hasChanges && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                      What changed
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {result.changes.map(([wrong, correct], i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                          <span style={{ background: "#fde8c8", color: "#7a4a10", padding: "2px 8px", borderRadius: 4, textDecoration: "line-through" }}>
                            {wrong || <em style={{ opacity: 0.4 }}>∅</em>}
                          </span>
                          <span style={{ color: "#c8bfb0" }}>→</span>
                          <span style={{ background: "#c8f0dc", color: "#1a5c35", padding: "2px 8px", borderRadius: 4 }}>
                            {correct || <em style={{ opacity: 0.4 }}>∅</em>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Corrected text with copy button */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                      Corrected
                    </p>
                    <CopyButton text={result.corrected || ""} />
                  </div>
                  <div style={{
                    padding: "12px 16px", background: "#c8f0dc", borderRadius: 10,
                    fontSize: 14, fontWeight: 300, color: "#1a1814", lineHeight: 1.7,
                    borderLeft: "3px solid #4caf7d", whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>
                    {result.corrected || "—"}
                  </div>
                </div>

                {/* Error cards */}
                {result.errors?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                      Errors found ({result.errors.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.errors.map((err, i) => {
                        const palette = [
                          { accent: "#fddcdc", border: "#e07070" },
                          { accent: "#fde8c8", border: "#c87030" },
                          { accent: "#d9e8fd", border: "#6fa3e8" },
                          { accent: "#ede8fd", border: "#8f70c8" },
                          { accent: "#fdfdd0", border: "#b8b840" },
                        ];
                        const { accent, border } = palette[i % palette.length];
                        return (
                          <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${border}`, background: accent }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderBottom: `1px solid ${border}` }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1814", letterSpacing: "-0.01em" }}>{err.error_type}</span>
                              {err.wrong && (
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                                  <span style={{ background: "#fde8c8", color: "#7a4a10", padding: "1px 7px", borderRadius: 4, textDecoration: "line-through" }}>
                                    {err.wrong}
                                  </span>
                                  <span style={{ color: "#c8bfb0" }}>→</span>
                                  <span style={{ background: "#c8f0dc", color: "#1a5c35", padding: "1px 7px", borderRadius: 4 }}>
                                    {err.correct}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div style={{ padding: "8px 14px", fontSize: 13, fontWeight: 300, color: "#1a1814", lineHeight: 1.6 }}>
                              {err.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
        )}  {/* end practiceMode ternary */}
      </div>

      {/* ── PROGRESS DRAWER ── */}
      {showProgress && (
        <ProgressDrawer history={history} onClear={clearHistory} onClose={() => setShowProgress(false)} />
      )}

      {error && <ErrorToast message={error} onDismiss={() => setError(null)} />}

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes shimmer  { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes slideUp  { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes drawerUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        textarea::placeholder { color: #c0b4a4; }
        textarea:focus        { border-color: #a09080 !important; }
        button:hover:not(:disabled) { opacity: 0.85; }
      `}</style>
    </>
  );
}