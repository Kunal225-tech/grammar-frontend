import { useState } from "react";

export default function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={{
        fontSize: 13, fontWeight: 400,
        color: open ? "#1a1814" : "#9a8f80",
        cursor: "pointer", letterSpacing: "0.01em",
        transition: "color 0.15s", userSelect: "none",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 12px)", right: 0,
          background: "#fdfaf6", border: "1px solid #e8e3da",
          borderRadius: 12, padding: "8px", minWidth: 200, zIndex: 200,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          {/* Arrow pip */}
          <div style={{
            position: "absolute", top: -5, right: 18,
            width: 9, height: 9, background: "#fdfaf6",
            border: "1px solid #e8e3da", borderRight: "none", borderBottom: "none",
            transform: "rotate(45deg)",
          }} />

          {items.map(({ title, desc, href }) => (
            <div
              key={title}
              title={href ? undefined : "Coming soon"}
              onClick={() => href && window.open(href, "_blank", "noopener")}
              style={{
                padding: "9px 12px", borderRadius: 8,
                cursor: href ? "pointer" : "default",
                transition: "background 0.12s",
                opacity: href ? 1 : 0.65,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f0ece4")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1814", margin: 0, marginBottom: 1 }}>{title}</p>
                {!href && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, color: "#b0a090",
                    background: "#f0ece4", borderRadius: 4, padding: "1px 5px",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>soon</span>
                )}
              </div>
              <p style={{ fontSize: 11, fontWeight: 300, color: "#9a8f80", margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
