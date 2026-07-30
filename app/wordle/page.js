"use client";

import { useMemo, useState } from "react";
import { WORD_BANK, PHONEME_MAP } from "../../lib/phonemeData";
import { generateWordleHtml } from "../../lib/generateWordleHtml";
import { getTheme } from "../../lib/themeCookie";
import WordlePreview from "../../components/WordlePreview";

const DIFFICULTIES = [
  { value: 3, label: "3 phonemes (easier)" },
  { value: 4, label: "4 phonemes" },
  { value: 5, label: "5 phonemes (harder)" },
];

export default function WordlePage() {
  const [difficulty, setDifficulty] = useState(3);
  const [wordIndex, setWordIndex] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [maxGuesses, setMaxGuesses] = useState(6);

  const wordList = WORD_BANK[difficulty];
  const [word, phonemes] = wordList[wordIndex] || wordList[0];

  const phonemeDisplay = phonemes.join(" ");

  function handleDifficultyChange(next) {
    setDifficulty(next);
    setWordIndex(0);
  }

  function handleGenerate() {
    const html = generateWordleHtml({
      targetWord: word,
      targetPhonemes: phonemes,
      phonemeMap: PHONEME_MAP,
      showHints,
      maxGuesses,
      theme: getTheme(),
    });
    downloadFile(`phoneme-wordle-${word}.html`, html);
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>Wordle Builder</h1>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: 640 }}>
        Choose a phoneme word and settings, preview the activity, then generate a downloadable
        HTML file for your class.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 24,
        }}
        className="wordle-grid"
      >
        <div className="card">
          <label className="field-label" htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => handleDifficultyChange(Number(e.target.value))}
            style={{ marginBottom: 16 }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <label className="field-label" htmlFor="wordChoice">Phoneme word</label>
          <select
            id="wordChoice"
            value={wordIndex}
            onChange={(e) => setWordIndex(Number(e.target.value))}
            style={{ marginBottom: 16, fontFamily: "var(--font-mono)" }}
          >
            {wordList.map(([w, units], i) => (
              <option key={w} value={i}>{units.join(" ")}</option>
            ))}
          </select>

          <label className="field-label">English word</label>
          <input type="text" value={word} readOnly style={{ marginBottom: 16, opacity: 0.75 }} />

          <label className="field-label" htmlFor="guesses">Number of guesses</label>
          <input
            id="guesses"
            type="number"
            min={3}
            max={10}
            value={maxGuesses}
            onChange={(e) => setMaxGuesses(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 20 }}>
            <span className="field-label">Show hints</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={showHints ? "btn" : "btn secondary"}
                onClick={() => setShowHints(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={!showHints ? "btn" : "btn secondary"}
                onClick={() => setShowHints(false)}
              >
                No
              </button>
            </div>
          </div>

          <button className="btn accent" style={{ width: "100%" }} onClick={handleGenerate}>
            Generate .html
          </button>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1rem", marginBottom: 12, opacity: 0.75 }}>Live preview</h2>
          <WordlePreview
            key={word + difficulty}
            word={word}
            phonemes={phonemes}
            showHints={showHints}
            maxGuesses={Number(maxGuesses) || 6}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .wordle-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
