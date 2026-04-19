export default function ErrorToast({ message, onDismiss }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "#2a1a1a", color: "#f7d5d5", borderRadius: 12,
      padding: "12px 20px", fontSize: 13,
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 9999, maxWidth: "90vw",
      animation: "slideUp 0.2s ease",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e07070", flexShrink: 0 }} />
      {message}
      <button
        onClick={onDismiss}
        style={{
          marginLeft: 8, background: "none", border: "none",
          color: "#f7d5d5", cursor: "pointer", fontSize: 16,
          lineHeight: 1, padding: 0, opacity: 0.7,
        }}
      >
        ×
      </button>
    </div>
  );
}
