"use client";

import { useMemo, useState } from "react";
import { PHONEME_KEYBOARD } from "../lib/phonemeData";

export default function WordlePreview({ word, phonemes, showHints, maxGuesses }) {
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState([]);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("");

  const wordLen = phonemes.length;

  function pressPhoneme(ipa) {
    if (finished || current.length >= wordLen) return;
    setCurrent((c) => [...c, ipa]);
  }

  function backspace() {
    if (finished) return;
    setCurrent((c) => c.slice(0, -1));
  }

  function submit() {
    if (finished) return;
    if (current.length !== wordLen) {
      setMessage("Not enough phonemes yet.");
      return;
    }
    const remaining = phonemes.slice();
    const result = new Array(wordLen).fill("miss");
    for (let i = 0; i < wordLen; i++) {
      if (current[i] === phonemes[i]) {
        result[i] = "hit";
        remaining[i] = null;
      }
    }
    for (let i = 0; i < wordLen; i++) {
      if (result[i] === "hit") continue;
      const idx = remaining.indexOf(current[i]);
      if (idx !== -1) {
        result[i] = "present";
        remaining[idx] = null;
      }
    }
    const newGuesses = [...guesses, { units: current, result }];
    setGuesses(newGuesses);
    setCurrent([]);
    const won = result.every((r) => r === "hit");
    if (won) {
      setFinished(true);
      setMessage(`Correct! The word is "${word}".`);
    } else if (newGuesses.length >= maxGuesses) {
      setFinished(true);
      setMessage(`Out of guesses. The word was "${word}".`);
    } else {
      setMessage("");
    }
  }

  const rows = Array.from({ length: maxGuesses }, (_, i) => guesses[i] || null);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {rows.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: wordLen }, (_, c) => {
              const isCurrentRow = r === guesses.length && !finished;
              const content = row ? row.units[c] : isCurrentRow ? current[c] : "";
              const status = row ? row.result[c] : null;
              return (
                <div
                  key={c}
                  style={{
                    width: 44,
                    height: 44,
                    border: "2px solid var(--border)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    background:
                      status === "hit"
                        ? "var(--primary)"
                        : status === "present"
                        ? "var(--accent)"
                        : status === "miss"
                        ? "var(--border)"
                        : "var(--surface)",
                    color: status === "hit" ? "#fff" : status === "present" ? "#201302" : "var(--ink)",
                  }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ minHeight: 22, fontWeight: 600, marginBottom: 10, fontSize: "0.9rem" }}>
        {message}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {PHONEME_KEYBOARD.map((p) => (
          <button
            key={p.ipa}
            type="button"
            disabled={finished}
            onClick={() => pressPhoneme(p.ipa)}
            title={showHints ? `${p.label} (as in ${p.example})` : undefined}
            style={{
              minWidth: 38,
              padding: "6px 5px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--paper)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: finished ? "not-allowed" : "pointer",
              opacity: finished ? 0.5 : 1,
            }}
          >
            {p.ipa}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" onClick={submit} disabled={finished}>Enter</button>
        <button className="btn secondary" onClick={backspace} disabled={finished}>Back</button>
      </div>
    </div>
  );
}
