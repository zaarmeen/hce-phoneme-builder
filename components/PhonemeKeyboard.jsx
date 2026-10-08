"use client";

import { PHONEME_KEYBOARD } from "../lib/phonemeData";

export default function PhonemeKeyboard({ onSelect, showHints = true, disabled = false }) {
  return (
    <div className="keyboard">
      {PHONEME_KEYBOARD.map((p) => (
        <button
          key={p.ipa}
          type="button"
          className="key"
          disabled={disabled}
          onClick={() => onSelect(p.ipa)}
          title={showHints ? `${p.label} (as in ${p.example})` : undefined}
        >
          {p.ipa}
        </button>
      ))}
    </div>
  );
}
