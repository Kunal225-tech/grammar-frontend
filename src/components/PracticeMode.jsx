import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ScoreRing from "./ScoreRing";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

// ─── Diff Comparison View ────────────────────────────────────────────────────
// Shows two sentences side-by-side with wrong/missing words highlighted.
function DiffRow({ label, text, highlightWords = [], highlightColor, labelColor }) {
  const tokens = text.split(/(\b\w+\b)/);
  const set = new Set(highlightWords.map((w) => w.toLowerCase()));
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{
        fontSize: 10, fontWeight: 600, color: labelColor ?? "#b0a090",
        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5,
      }}>{label}</p>
      <div style={{
        padding: "12px 16px", borderRadius: 10, fontSize: 14,
        fontWeight: 300, lineHeight: 1.75, color: "#1a1814",
        background: "#fdfaf6", border: "1px solid #e8e3da",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {tokens.map((tok, i) =>
          set.has(tok.toLowerCase()) ? (
            <mark key={i} style={{
              background: highlightColor ?? "#fde8c8",
              color: "#7a4a10", padding: "1px 4px",
              borderRadius: 4, fontStyle: "normal",
            }}>{tok}</mark>
          ) : tok
        )}
      </div>
    </div>
  );
}

// ─── Streak Badge ────────────────────────────────────────────────────────────
function StreakBadge({ streak }) {
  if (streak < 2) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#fffaf3", border: "1px solid #e8c898",
      borderRadius: 20, padding: "3px 12px", fontSize: 12,
      fontWeight: 500, color: "#7a4a10",
      animation: "fadeIn 0.3s ease",
    }}>
      🔥 {streak} streak
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PracticeMode({ onExit }) {
  const [phase, setPhase]         = useState("loading"); // loading | question | result
  const [question, setQuestion]   = useState(null);       // {wrong, correct}
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult]       = useState(null);       // API response
  const [checking, setChecking]   = useState(false);
  const [error, setError]         = useState(null);

  // Session stats
  const [questionNum, setQuestionNum] = useState(1);
  const [scores, setScores]           = useState([]);          // per-question scores
  const [streak, setStreak]           = useState(0);           // consecutive perfects

  const fetchQuestion = useCallback(async () => {
    setPhase("loading");
    setUserAnswer("");
    setResult(null);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/practice`);
      setQuestion(res.data);
      setPhase("question");
    } catch {
      setError("Could not load a question. Make sure the server is running.");
      setPhase("question");
    }
  }, []);

  useEffect(() => { fetchQuestion(); }, [fetchQuestion]);

  const handleCheck = async () => {
    if (!userAnswer.trim() || !question) return;
    setChecking(true);
    try {
      const res = await axios.post(`${API_URL}/practice/check`, {
        user_answer: userAnswer,
        correct:     question.correct,
      });
      setResult(res.data);
      setScores((s) => [...s, res.data.score]);
      setStreak((s) => res.data.score === 100 ? s + 1 : 0);
      setPhase("result");
    } catch {
      setError("Could not check your answer. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleNext = () => {
    setQuestionNum((n) => n + 1);
    fetchQuestion();
  };

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  // ── LOADING ──
  if (phase === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
        <div style={{
          width: 32, height: 32, border: "2.5px solid #e8e3da",
          borderTopColor: "#1a1814", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: 13, color: "#b0a090" }}>Loading question…</p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, overflowY: "auto",
      padding: "2rem 2.5rem",
      display: "flex", flexDirection: "column", gap: 24,
      maxWidth: 720, margin: "0 auto", width: "100%",
    }}>

      {/* ── Header row ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{
            fontSize: 10, fontWeight: 500, color: "#b0a090",
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6,
          }}>Practice Mode</p>
          <h2 style={{
            fontFamily: "'Lora', serif", fontSize: "clamp(22px,3vw,30px)",
            fontWeight: 400, color: "#1a1814", letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            Fix the sentence,{" "}
            <span style={{ fontStyle: "italic", color: "#6b5f4e" }}>earn your score.</span>
          </h2>
        </div>
        <button
          onClick={onExit}
          style={{
            background: "none", border: "1px solid #d8d0c4", borderRadius: 30,
            padding: "5px 14px", fontSize: 12, color: "#9a8f80", cursor: "pointer",
            transition: "all 0.15s", flexShrink: 0, marginTop: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a1814"; e.currentTarget.style.color = "#1a1814"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#d8d0c4"; e.currentTarget.style.color = "#9a8f80"; }}
        >
          ← Back
        </button>
      </div>

      {/* ── Session stat bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#b0a090" }}>
          Question <strong style={{ color: "#1a1814" }}>{questionNum}</strong>
        </span>
        {avgScore !== null && (
          <span style={{ fontSize: 12, color: "#b0a090" }}>
            Session avg: <strong style={{ color: "#1a1814" }}>{avgScore}/100</strong>
          </span>
        )}
        <StreakBadge streak={streak} />
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          padding: "10px 16px", background: "#fddcdc", border: "1px solid #e07070",
          borderRadius: 10, fontSize: 13, color: "#7a2a2a",
        }}>{error}</div>
      )}

      {/* ── Question card ── */}
      {question && (
        <div style={{
          background: "#fdfaf6", border: "1px solid #e8e3da",
          borderRadius: 16, overflow: "hidden",
        }}>
          {/* Card header */}
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid #e8e3da",
            background: "#f7f4ef",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "#fde8c8", border: "1px solid #e8c898",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#7a4a10", fontWeight: 600, flexShrink: 0,
            }}>!</span>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#6b5f4e", margin: 0 }}>
              This sentence contains grammar errors. Type the corrected version below.
            </p>
          </div>

          {/* Wrong sentence display */}
          <div style={{ padding: "18px 20px 14px" }}>
            <p style={{
              fontSize: 10, fontWeight: 500, color: "#b0a090",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
            }}>Incorrect sentence</p>
            <p style={{
              fontSize: 16, fontWeight: 400, color: "#1a1814",
              lineHeight: 1.6, fontFamily: "'Lora', serif",
              background: "#fff8ee", border: "1px solid #e8c898",
              borderRadius: 10, padding: "12px 16px",
              borderLeft: "3px solid #c87030",
            }}>
              {question.wrong}
            </p>
          </div>

          {/* User input */}
          <div style={{ padding: "0 20px 20px" }}>
            <p style={{
              fontSize: 10, fontWeight: 500, color: "#b0a090",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
            }}>Your correction</p>
            <textarea
              id="practice-input"
              placeholder="Type the corrected sentence here…"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleCheck(); }}
              disabled={phase === "result"}
              style={{
                width: "100%", minHeight: 80, padding: "12px 14px",
                fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                lineHeight: 1.7, border: "1px solid #d8d0c4", borderRadius: 10,
                background: phase === "result" ? "#f7f4ef" : "#ffffff",
                color: "#1a1814", resize: "none", outline: "none",
                transition: "border-color 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#a09080")}
              onBlur={e => (e.target.style.borderColor = "#d8d0c4")}
            />

            {/* Submit / Next */}
            {phase === "question" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <button
                  id="btn-practice-submit"
                  onClick={handleCheck}
                  disabled={checking || !userAnswer.trim()}
                  style={{
                    padding: "9px 24px", fontSize: 14, fontWeight: 500,
                    border: "1px solid #1a1814", borderRadius: 40,
                    background: checking || !userAnswer.trim() ? "transparent" : "#1a1814",
                    color: checking || !userAnswer.trim() ? "#b0a090" : "#f7f4ef",
                    cursor: checking || !userAnswer.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                >
                  {checking ? (
                    <>
                      <span style={{
                        width: 11, height: 11, border: "1.5px solid rgba(26,24,20,0.2)",
                        borderTopColor: "#1a1814", borderRadius: "50%",
                        display: "inline-block", animation: "spin 0.8s linear infinite",
                      }} />
                      Checking…
                    </>
                  ) : "Check my answer →"}
                </button>
                <span style={{ fontSize: 11, color: "#c8bfb0" }}>Ctrl+↵ to submit</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Result panel ── */}
      {phase === "result" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.35s ease" }}>

          {/* Score + feedback */}
          <div style={{
            display: "flex", alignItems: "center", gap: 24,
            background: "#fdfaf6", border: "1px solid #e8e3da",
            borderRadius: 16, padding: "18px 24px",
          }}>
            <ScoreRing score={result.score} label="Your score" />
            <div>
              <p style={{
                fontSize: 15, fontWeight: 400, color: "#1a1814",
                lineHeight: 1.5, marginBottom: 4,
              }}>{result.feedback}</p>
              {result.score === 100 && (
                <p style={{ fontSize: 12, color: "#4caf7d", fontWeight: 500 }}>
                  Keep the streak going! 🎯
                </p>
              )}
            </div>
          </div>

          {/* Session mini-chart (last 8 scores) */}
          {scores.length > 1 && (
            <div>
              <p style={{
                fontSize: 10, fontWeight: 500, color: "#b0a090",
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10,
              }}>Score trend this session</p>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 44 }}>
                {scores.slice(-8).map((s, i) => (
                  <div key={i} style={{
                    flex: 1, borderRadius: "3px 3px 0 0",
                    background: s === 100 ? "#4caf7d" : s >= 70 ? "#fde8c8" : "#fddcdc",
                    height: Math.max(4, (s / 100) * 44),
                    transition: "height 0.4s",
                    position: "relative",
                  }}>
                    <span style={{
                      position: "absolute", bottom: "105%", left: "50%",
                      transform: "translateX(-50%)", fontSize: 9, color: "#b0a090",
                      whiteSpace: "nowrap",
                    }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diff comparison */}
          {result.changes?.length > 0 ? (
            <div>
              <p style={{
                fontSize: 10, fontWeight: 500, color: "#b0a090",
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
              }}>Comparison</p>
              <DiffRow
                label="Your answer"
                text={userAnswer}
                highlightWords={result.changes.map(([w]) => w).filter(Boolean)}
                highlightColor="#fddcdc"
                labelColor="#c87070"
              />
              <DiffRow
                label="Expected answer"
                text={result.correct}
                highlightWords={result.changes.map(([, c]) => c).filter(Boolean)}
                highlightColor="#c8f0dc"
                labelColor="#4caf7d"
              />
            </div>
          ) : (
            <div style={{
              padding: "14px 18px", background: "#c8f0dc",
              border: "1px solid #4caf7d", borderRadius: 12,
              fontSize: 14, color: "#1a5c35",
            }}>
              ✓ Your answer exactly matches the expected correction.
            </div>
          )}

          {/* Error cards */}
          {result.errors?.length > 0 && (
            <div>
              <p style={{
                fontSize: 10, fontWeight: 500, color: "#b0a090",
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10,
              }}>What you missed ({result.errors.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.errors.map((err, i) => {
                  const palette = [
                    { accent: "#fddcdc", border: "#e07070" },
                    { accent: "#fde8c8", border: "#c87030" },
                    { accent: "#d9e8fd", border: "#6fa3e8" },
                    { accent: "#ede8fd", border: "#8f70c8" },
                  ];
                  const { accent, border } = palette[i % palette.length];
                  return (
                    <div key={i} style={{
                      borderRadius: 10, overflow: "hidden",
                      border: `1px solid ${border}`, background: accent,
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 14px", borderBottom: `1px solid ${border}`,
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1814" }}>
                          {err.error_type}
                        </span>
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

          {/* Next question button */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
            <button
              id="btn-practice-next"
              onClick={handleNext}
              style={{
                padding: "10px 28px", fontSize: 14, fontWeight: 500,
                border: "1px solid #1a1814", borderRadius: 40,
                background: "#1a1814", color: "#f7f4ef",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Next question →
            </button>
            <button
              onClick={onExit}
              style={{
                padding: "10px 20px", fontSize: 14, fontWeight: 400,
                border: "1px solid #d8d0c4", borderRadius: 40,
                background: "transparent", color: "#9a8f80",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              Exit practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
