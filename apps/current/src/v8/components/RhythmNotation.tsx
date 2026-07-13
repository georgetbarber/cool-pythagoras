const VOCABULARY = new Set([
  "whole", "half", "quarter", "eighth", "sixteenth", "rest", "tie", "dotted-half", "dotted-quarter"
]);

export function RhythmNotation({ pattern = "quarter quarter quarter quarter", metre = "4/4" }: { pattern?: string; metre?: string }) {
  const tokens = pattern.split(/\s+/).slice(0, 8);
  const valid = tokens.length > 0 && tokens.every((token) => VOCABULARY.has(token)) && tokens[0] !== "tie";
  if (!valid) {
    return (
      <figure className="rhythm-notation rhythm-description">
        <p className="rhythm-words">{pattern}</p>
        <figcaption>{pattern}</figcaption>
      </figure>
    );
  }
  const gap = 520 / Math.max(tokens.length, 1);
  return (
    <figure className="rhythm-notation">
      <svg viewBox="0 0 640 120" role="img" aria-labelledby="rhythm-title rhythm-description">
        <title id="rhythm-title">Rhythm in {metre}</title>
        <desc id="rhythm-description">{pattern}</desc>
        <line x1="38" y1="68" x2="610" y2="68" />
        <text x="6" y="73">{metre}</text>
        {tokens.map((token, index) => {
          const x = 75 + index * gap;
          if (token === "tie") {
            const previousX = 75 + (index - 1) * gap;
            return <g key={`${token}-${index}`}><path d={`M${previousX} 60 q ${gap / 2} -14 ${gap} 0`} fill="none" /><text x={x - 14} y="104">(tie)</text></g>;
          }
          if (token === "rest") {
            return <g key={`${token}-${index}`}><path d={`M${x - 8} 54 h16 l-10 18 h14`} /><text x={x - 12} y="104">rest</text></g>;
          }
          const hollow = token === "whole" || token === "half" || token === "dotted-half";
          const stem = token !== "whole";
          const dotted = token === "dotted-half" || token === "dotted-quarter";
          const flags = token === "sixteenth" ? 2 : token === "eighth" ? 1 : 0;
          return (
            <g key={`${token}-${index}`}>
              <circle cx={x} cy="68" r="8" fill={hollow ? "none" : undefined} />
              {stem && <line x1={x + 7} y1="68" x2={x + 7} y2="32" />}
              {flags >= 1 && <path d={`M${x + 7} 32 q10 4 8 14`} fill="none" />}
              {flags === 2 && <path d={`M${x + 7} 42 q10 4 8 14`} fill="none" />}
              {dotted && <circle cx={x + 15} cy="68" r="2.5" />}
              <text x={x - 22} y="104">{token}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>{pattern}</figcaption>
    </figure>
  );
}
