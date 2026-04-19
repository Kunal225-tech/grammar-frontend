/**
 * XSS-safe highlighted text renderer.
 * Splits input into React elements — no dangerouslySetInnerHTML.
 * Wrong words (from `changes`) are wrapped in <mark> tags.
 */
export default function HighlightedText({ text, changes }) {
  // Build a set of wrong words to highlight (case-insensitive)
  const wrongWords = new Set(
    (changes ?? [])
      .map(([w]) => w?.trim().toLowerCase())
      .filter(Boolean)
  );

  // Split text into word tokens and non-word separators (preserves whitespace/punctuation)
  const tokens = text.split(/(\b\w+\b)/);

  return (
    <div style={{
      padding: "14px 16px", fontSize: 14, fontWeight: 300, lineHeight: 1.75,
      border: "1px solid #e8c898", borderRadius: 12, background: "#fffaf3",
      color: "#1a1814", whiteSpace: "pre-wrap", wordBreak: "break-word",
    }}>
      {tokens.map((token, i) => {
        const isWrong = wrongWords.has(token.toLowerCase());
        return isWrong ? (
          <mark
            key={i}
            style={{
              background: "#fde8c8", color: "#7a4a10",
              padding: "1px 5px", borderRadius: 4,
              fontStyle: "normal",
            }}
          >
            {token}
          </mark>
        ) : (
          token
        );
      })}
    </div>
  );
}
