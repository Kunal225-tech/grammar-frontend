export default function ProgressDrawer({ history, onClear, onClose }) {
  const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : 0);
  const avgBefore = avg(history.map((h) => h.original_score));
  const avgAfter  = avg(history.map((h) => h.corrected_score));
  const avgDelta  = avgAfter - avgBefore;
  const recent    = history.slice(-8);

  const errorCounts = {};
  history.forEach((h) => {
    if (h.error_type) errorCounts[h.error_type] = (errorCounts[h.error_type] ?? 0) + 1;
  });
  const topError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(26,24,20,0.3)", zIndex: 400,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500,
        background: "#fdfaf6", borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 48px rgba(0,0,0,0.12)",
        padding: "28px 32px 32px", maxHeight: "72vh", overflowY: "auto",
        animation: "drawerUp 0.28s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
              My learning progress
            </p>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 400, color: "#1a1814", letterSpacing: "-0.02em" }}>
              {history.length} correction{history.length !== 1 ? "s" : ""} made
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClear}
              style={{ background: "none", border: "1px solid #e8e3da", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#b0a090", cursor: "pointer" }}
            >
              Clear
            </button>
            <button
              onClick={onClose}
              style={{ background: "#1a1814", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#f7f4ef", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Avg score before", val: `${avgBefore}/100`, bg: "#fddcdc", border: "#e07070", text: "#7a2a2a" },
            { label: "Avg score after",  val: `${avgAfter}/100`,  bg: "#c8f0dc", border: "#4caf7d", text: "#1a5c35" },
            { label: "Avg improvement",  val: `+${avgDelta} pts`, bg: "#d9e8fd", border: "#6fa3e8", text: "#1a3a6a" },
          ].map(({ label, val, bg, border, text }) => (
            <div key={label} style={{ padding: "14px 16px", background: bg, borderRadius: 12, borderLeft: `3px solid ${border}` }}>
              <p style={{ fontSize: 10, fontWeight: 500, color: text, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, opacity: 0.7 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 600, color: text, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Top mistake callout */}
        {topError && (
          <div style={{
            background: "#fffaf3", border: "1px solid #e8c898", borderRadius: 12,
            padding: "14px 18px", marginBottom: 20,
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#7a4a10", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                Your most common mistake
              </p>
              <p style={{ fontSize: 14, color: "#1a1814" }}>
                <strong>{topError[0]}</strong> — {topError[1]} time{topError[1] !== 1 ? "s" : ""}.{" "}
                <span style={{ color: "#9a8f80" }}>Keep practising.</span>
              </p>
            </div>
          </div>
        )}

        {/* Bar chart */}
        <p style={{ fontSize: 10, fontWeight: 500, color: "#b0a090", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
          Score trend (last {recent.length})
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 56 }}>
          {recent.map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", gap: 2, alignItems: "flex-end" }}>
              <div style={{ flex: 1, background: "#fde8c8", borderRadius: "3px 3px 0 0", height: Math.max(4, (h.original_score / 100) * 56), transition: "height 0.4s" }} />
              <div style={{ flex: 1, background: "#c8f0dc", borderRadius: "3px 3px 0 0", height: Math.max(4, (h.corrected_score / 100) * 56), transition: "height 0.4s" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#fde8c8", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#b0a090" }}>Before</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#c8f0dc", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#b0a090" }}>After</span>
          </div>
        </div>
      </div>
    </>
  );
}
