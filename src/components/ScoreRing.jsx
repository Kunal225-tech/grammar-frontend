export default function ScoreRing({ score, label, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#4caf7d" : score >= 55 ? "#e8a840" : "#e07070";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ece8e0" strokeWidth={7} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
        <text
          x={size / 2} y={size / 2}
          dominantBaseline="middle" textAnchor="middle"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
            fontSize: 18, fontWeight: 600, fill: color,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {score}
        </text>
      </svg>
      <span style={{
        fontSize: 10, color: "#b0a090",
        letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
      }}>
        {label}
      </span>
    </div>
  );
}
