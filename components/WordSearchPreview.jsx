"use client";

import { useMemo } from "react";
import { buildWordSearchGrid } from "../lib/wordSearchEngine";
import { PHONEME_MAP } from "../lib/phonemeData";

export default function WordSearchPreview({ words, rows, cols, showHints }) {
  const grid = useMemo(() => buildWordSearchGrid(words, rows, cols), [words, rows, cols]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 32px)`,
          gridTemplateRows: `repeat(${rows}, 32px)`,
          gap: 3,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 10,
        }}
      >
        {grid.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "var(--paper)",
                border: "1px solid var(--border)",
                borderRadius: 4,
              }}
            >
              {cell}
            </div>
          ))
        )}
      </div>

      <div style={{ minWidth: 180 }}>
        <h3 style={{ fontSize: "0.95rem", marginBottom: 10, opacity: 0.75 }}>Word list</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {words.map((w) => (
            <span
              key={w.display}
              title={
                showHints
                  ? w.units.map((u) => (PHONEME_MAP[u] ? PHONEME_MAP[u].label : u)).join(" ") +
                    ` = "${w.display}"`
                  : undefined
              }
              style={{
                fontFamily: "var(--font-mono)",
                padding: "6px 10px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--paper)",
                width: "fit-content",
                cursor: "help",
              }}
            >
              {w.cleanDisplay}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
