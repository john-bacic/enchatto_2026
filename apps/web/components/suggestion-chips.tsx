"use client";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "0.35rem",
        flexWrap: "wrap",
        marginTop: "0.35rem",
      }}
    >
      {suggestions.slice(0, 4).map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          style={{
            fontSize: "0.75rem",
            padding: "0.3rem 0.6rem",
            borderRadius: "999px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--primary)",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
