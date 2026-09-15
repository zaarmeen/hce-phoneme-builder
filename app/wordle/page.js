"use client";

import { useEffect, useState } from "react";
import { WORD_BANK, PHONEME_MAP } from "../../lib/phonemeData";
import { generateWordleHtml } from "../../lib/generateWordleHtml";
import { getTheme } from "../../lib/themeCookie";
import { listActivitySets } from "../../lib/apiClient";
import WordlePreview from "../../components/WordlePreview";

const DIFFICULTIES = [
  { value: 3, label: "3 phonemes (easier)" },
  { value: 4, label: "4 phonemes" },
  { value: 5, label: "5 phonemes (harder)" },
];

export default function WordlePage() {
  // Backend-driven state (Assessment 2): saved Wordle activity sets, loaded from the API.
  const [savedSets, setSavedSets] = useState([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [selectedSetId, setSelectedSetId] = useState("builtin");
  const [wordIndex, setWordIndex] = useState(0);

  // Built-in demo bank (Assessment 1 fallback — used when no saved sets exist yet).
  const [difficulty, setDifficulty] = useState(3);

  const [showHints, setShowHints] = useState(true);
  const [maxGuesses, setMaxGuesses] = useState(6);

  useEffect(() => {
    listActivitySets()
      .then((sets) => {
        const wordleSets = sets.filter((s) => s.type === "WORDLE" && s.words.length > 0);
        setSavedSets(wordleSets);
        if (wordleSets.length > 0) {
          setSelectedSetId(wordleSets[0].id);
          setShowHints(wordleSets[0].showHints);
          setMaxGuesses(wordleSets[0].maxGuesses ?? 6);
        }
      })
      .catch(() => {
        // Backend not reachable yet (e.g. first run before the DB exists) — silently fall
        // back to the built-in demo bank rather than blocking the page.
        setSavedSets([]);
      })
      .finally(() => setLoadingSets(false));
  }, []);

  const selectedSavedSet =
    selectedSetId !== "builtin" ? savedSets.find((s) => s.id === selectedSetId) : null;

  const wordList = selectedSavedSet
    ? selectedSavedSet.words.map((w) => [w.text, w.phonemes])
    : WORD_BANK[difficulty];
  const [word, phonemes] = wordList[wordIndex] || wordList[0];

  function handleSetChange(nextId) {
    setSelectedSetId(nextId);
    setWordIndex(0);
    const set = nextId !== "builtin" ? savedSets.find((s) => s.id === nextId) : null;
    if (set) {
      setShowHints(set.showHints);
      setMaxGuesses(set.maxGuesses ?? 6);
    }
  }

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
        Choose a phoneme word list and settings, preview the activity, then generate a
        downloadable HTML file for your class. Word lists saved in{" "}
        <a href="/manage" style={{ textDecoration: "underline" }}>Manage Word Lists</a> appear
        here automatically.
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
          <label className="field-label" htmlFor="sourceSet">Word list</label>
          <select
            id="sourceSet"
            value={selectedSetId}
            onChange={(e) =>
              handleSetChange(e.target.value === "builtin" ? "builtin" : Number(e.target.value))
            }
            style={{ marginBottom: 16 }}
            disabled={loadingSets}
          >
            <option value="builtin">Built-in demo bank (not saved)</option>
            {savedSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.words.length} words)
              </option>
            ))}
          </select>

          {selectedSetId === "builtin" && (
            <>
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
            </>
          )}

          <label className="field-label" htmlFor="wordChoice">Phoneme word</label>
          <select
            id="wordChoice"
            value={wordIndex}
            onChange={(e) => setWordIndex(Number(e.target.value))}
            style={{ marginBottom: 16, fontFamily: "var(--font-mono)" }}
          >
            {wordList.map(([w, units], i) => (
              <option key={`${w}-${i}`} value={i}>{units.join(" ")}</option>
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
            key={word + selectedSetId}
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
