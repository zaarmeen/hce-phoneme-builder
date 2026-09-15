"use client";

import { PHONEME_KEYBOARD } from "../lib/phonemeData";

export default function PhonemeKeyboard({ onSelect, showHints = true, disabled = false }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      {PHONEME_KEYBOARD.map((p) => (
        <button
          key={p.ipa}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(p.ipa)}
          title={showHints ? `${p.label} (as in ${p.example})` : undefined}
          style={{
            minWidth: 42,
            padding: "8px 6px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {p.ipa}
        </button>
      ))}
    </div>
  );
}
