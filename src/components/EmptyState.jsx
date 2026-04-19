export default function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: 16,
      padding: "2rem", textAlign: "center", userSelect: "none",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "#f0ece4",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
            stroke="#b0a090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p style={{
          fontSize: 15, fontWeight: 500, color: "#7a6f5e", marginBottom: 6,
          fontFamily: "'Lora', serif", fontStyle: "italic",
        }}>
          Your results will appear here
        </p>
        <p style={{ fontSize: 13, fontWeight: 300, color: "#b0a090", lineHeight: 1.6, maxWidth: 260 }}>
          Type or paste a sentence on the left and click{" "}
          <strong style={{ fontWeight: 500 }}>"Correct sentence"</strong> to get started.
        </p>
      </div>
    </div>
  );
}
