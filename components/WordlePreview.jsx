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

  function restart() {
    setGuesses([]);
    setCurrent([]);
    setFinished(false);
    setMessage("");
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

  // Best result seen so far for each phoneme, to colour the keyboard like real Wordle:
  // a phoneme that was ever a hit stays teal, otherwise indigo ("present") beats grey.
  const keyStates = useMemo(() => {
    const rank = { miss: 1, present: 2, hit: 3 };
    const states = {};
    for (const g of guesses) {
      g.units.forEach((u, i) => {
        const r = g.result[i];
        if (!states[u] || rank[r] > rank[states[u]]) states[u] = r;
      });
    }
    return states;
  }, [guesses]);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, perspective: 600 }}>
        {rows.map((row, r) => (
          <div key={r} className="tile-row">
            {Array.from({ length: wordLen }, (_, c) => {
              const isCurrentRow = r === guesses.length && !finished;
              const content = row ? row.units[c] : isCurrentRow ? current[c] : "";
              const status = row ? row.result[c] : undefined;
              return (
                <div
                  key={c}
                  className={!row && content ? "tile filled" : "tile"}
                  data-state={status}
                  style={{ "--i": c }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div aria-live="polite" style={{ minHeight: 22, fontWeight: 600, marginBottom: 10, fontSize: "0.9rem" }}>
        {message}
      </div>

      <div className="keyboard" style={{ marginBottom: 14 }}>
        {PHONEME_KEYBOARD.map((p) => (
          <button
            key={p.ipa}
            type="button"
            className="key small"
            data-state={keyStates[p.ipa]}
            disabled={finished}
            onClick={() => pressPhoneme(p.ipa)}
            title={showHints ? `${p.label} (as in ${p.example})` : undefined}
          >
            {p.ipa}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" onClick={submit} disabled={finished || current.length === 0}>Enter</button>
        <button className="btn secondary" onClick={backspace} disabled={finished || current.length === 0}>
          Back
        </button>
        {(finished || guesses.length > 0) && (
          <button className="btn secondary" onClick={restart} style={{ marginLeft: "auto" }}>
            Play again
          </button>
        )}
      </div>
    </div>
  );
}
