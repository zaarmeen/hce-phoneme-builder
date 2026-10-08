"use client";

import { useEffect, useRef, useState } from "react";
import { WORD_BANK, PHONEME_MAP } from "../../lib/phonemeData";
import { generateWordleHtml } from "../../lib/generateWordleHtml";
import { getTheme } from "../../lib/themeCookie";
import { trackEvent, startPageTimer } from "../../lib/trackEvent";
import { useActivityBuilder, BUILTIN } from "../../lib/useActivityBuilder";
import { ActivityPicker, SaveButtons } from "../../components/BuilderSaveControls";
import WordlePreview from "../../components/WordlePreview";

const DIFFICULTIES = [
  { value: 3, label: "3 phonemes (easier)" },
  { value: 4, label: "4 phonemes" },
  { value: 5, label: "5 phonemes (harder)" },
];

// The settings a saved Wordle activity stores (see useActivityBuilder).
const DEFAULT_SETTINGS = { maxGuesses: 6, showHints: true };

export default function WordlePage() {
  // Saving and loading activities, and the word lists they use (backend-driven).
  const builder = useActivityBuilder({ type: "WORDLE", defaultSettings: DEFAULT_SETTINGS });
  const { selectedWordList, wordListId, settings, updateSetting } = builder;
  const { maxGuesses, showHints } = settings;

  const [wordIndex, setWordIndex] = useState(0);
  // Built-in demo bank (Assessment 1 fallback, used when no saved word list is chosen).
  const [difficulty, setDifficulty] = useState(3);

  // Records how long this page stayed open: flushed on unmount (navigating away)
  // or earlier, from handleGenerate, whichever happens first (see startPageTimer).
  const flushPageTimer = useRef(() => {});
  useEffect(() => {
    flushPageTimer.current = startPageTimer("/wordle");
    return () => flushPageTimer.current();
  }, []);

  // Pick the first word again whenever the word list changes.
  useEffect(() => setWordIndex(0), [wordListId, difficulty]);

  const wordList = selectedWordList
    ? selectedWordList.words.map((w) => [w.text, w.phonemes])
    : WORD_BANK[difficulty];
  const [word, phonemes] = wordList[wordIndex] || wordList[0] || [];

  function handleGenerate() {
    flushPageTimer.current();

    if (!word || !phonemes || phonemes.length === 0) {
      trackEvent({ type: "GENERATION_FAILURE", activityType: "WORDLE", reason: "empty_word_list" });
      alert("Can't generate — this word list has no words with phonemes.");
      return;
    }

    try {
      const html = generateWordleHtml({
        targetWord: word,
        targetPhonemes: phonemes,
        phonemeMap: PHONEME_MAP,
        showHints,
        maxGuesses: Number(maxGuesses) || 6,
        theme: getTheme(),
      });
      downloadFile(`phoneme-wordle-${word}.html`, html);
      trackEvent({ type: "GENERATION_SUCCESS", activityType: "WORDLE" });
    } catch (err) {
      trackEvent({ type: "GENERATION_FAILURE", activityType: "WORDLE", reason: "generator_error" });
      alert("Something went wrong generating the activity. Please try again.");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>Wordle Builder</h1>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: 640 }}>
        Open a saved activity or start a new one, choose a word list and settings, preview
        it, then save it for later or generate a downloadable HTML file for your class. Word
        lists are created in{" "}
        <a href="/manage" style={{ textDecoration: "underline" }}>Manage Word Lists</a>.
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
          <ActivityPicker builder={builder} builtinLabel="Built-in demo bank (not saved)" />

          {wordListId === BUILTIN && (
            <>
              <label className="field-label" htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
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
            disabled={wordList.length === 0}
          >
            {wordList.map(([w, units], i) => (
              <option key={`${w}-${i}`} value={i}>{units.join(" ")}</option>
            ))}
          </select>

          <label className="field-label">English word</label>
          <input type="text" value={word ?? ""} readOnly style={{ marginBottom: 16, opacity: 0.75 }} />

          <label className="field-label" htmlFor="guesses">Number of guesses</label>
          <input
            id="guesses"
            type="number"
            min={3}
            max={10}
            value={maxGuesses}
            onChange={(e) => updateSetting("maxGuesses", e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 20 }}>
            <span className="field-label">Show hints</span>
            <div className="segmented" role="group" aria-label="Show hints">
              <button type="button" aria-pressed={showHints} onClick={() => updateSetting("showHints", true)}>
                Yes
              </button>
              <button type="button" aria-pressed={!showHints} onClick={() => updateSetting("showHints", false)}>
                No
              </button>
            </div>
          </div>

          <SaveButtons builder={builder} />

          <button className="btn accent block" onClick={handleGenerate}>
            Generate .html
          </button>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1rem", marginBottom: 12, opacity: 0.75 }}>Live preview</h2>
          {word ? (
            <WordlePreview
              key={`${word}-${wordListId}-${wordIndex}`}
              word={word}
              phonemes={phonemes}
              showHints={showHints}
              maxGuesses={Number(maxGuesses) || 6}
            />
          ) : (
            <p style={{ opacity: 0.7 }}>This word list has no words yet. Add some on the Manage page.</p>
          )}
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
