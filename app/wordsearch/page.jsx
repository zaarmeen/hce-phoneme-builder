"use client";

import { useEffect, useRef, useState } from "react";
import { WORD_SEARCH_DEFAULT, PHONEME_MAP } from "../../lib/phonemeData";
import { generateWordSearchHtml } from "../../lib/generateWordSearchHtml";
import { getTheme } from "../../lib/themeCookie";
import { trackEvent, startPageTimer } from "../../lib/trackEvent";
import { useActivityBuilder } from "../../lib/useActivityBuilder";
import { ActivityPicker, SaveButtons } from "../../components/BuilderSaveControls";
import WordSearchPreview from "../../components/WordSearchPreview";

const builtinWords = WORD_SEARCH_DEFAULT.map(([display, units]) => ({
  display,
  cleanDisplay: units.join(" "),
  units,
}));

// The settings a saved Word Search activity stores (see useActivityBuilder).
const DEFAULT_SETTINGS = { rows: 10, cols: 10, showHints: true };

export default function WordSearchPage() {
  // Saving and loading activities, and the word lists they use (backend-driven).
  const builder = useActivityBuilder({ type: "WORDSEARCH", defaultSettings: DEFAULT_SETTINGS });
  const { selectedWordList, wordListId, settings, updateSetting } = builder;
  const rows = Number(settings.rows) || 10;
  const cols = Number(settings.cols) || 10;
  const { showHints } = settings;

  const [seed, setSeed] = useState(0);

  const flushPageTimer = useRef(() => {});
  useEffect(() => {
    flushPageTimer.current = startPageTimer("/wordsearch");
    return () => flushPageTimer.current();
  }, []);

  // Reshuffle the preview whenever the word list changes.
  useEffect(() => setSeed((s) => s + 1), [wordListId]);

  const wordsForPreview = selectedWordList
    ? selectedWordList.words.map((w) => ({
        display: w.text,
        cleanDisplay: w.phonemes.join(" "),
        units: w.phonemes,
      }))
    : builtinWords;

  function handleGenerate() {
    flushPageTimer.current();

    if (!wordsForPreview || wordsForPreview.length === 0) {
      trackEvent({ type: "GENERATION_FAILURE", activityType: "WORDSEARCH", reason: "empty_word_list" });
      alert("Can't generate — this word list has no words.");
      return;
    }

    try {
      const html = generateWordSearchHtml({
        words: wordsForPreview,
        phonemeMap: PHONEME_MAP,
        rows,
        cols,
        showHints,
        theme: getTheme(),
      });
      downloadFile("phoneme-word-search.html", html);
      trackEvent({ type: "GENERATION_SUCCESS", activityType: "WORDSEARCH" });
    } catch (err) {
      trackEvent({ type: "GENERATION_FAILURE", activityType: "WORDSEARCH", reason: "generator_error" });
      alert("Something went wrong generating the activity. Please try again.");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>Word Search Builder</h1>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: 640 }}>
        Open a saved activity or start a new one, pick a word list (or the built-in
        five-word demo), adjust the grid size and preview it, then save it for later or
        generate a downloadable HTML file. Word lists are created on the{" "}
        <a href="/manage" style={{ textDecoration: "underline" }}>Manage Word Lists</a> page.
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}
        className="ws-grid"
      >
        <div className="card">
          <ActivityPicker builder={builder} builtinLabel="Built-in demo list (5 words, not saved)" />

          <label className="field-label" htmlFor="rows">Rows</label>
          <input
            id="rows"
            type="number"
            min={6}
            max={16}
            value={settings.rows}
            onChange={(e) => updateSetting("rows", e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <label className="field-label" htmlFor="cols">Columns</label>
          <input
            id="cols"
            type="number"
            min={6}
            max={16}
            value={settings.cols}
            onChange={(e) => updateSetting("cols", e.target.value)}
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

          <button className="btn secondary block" style={{ marginBottom: 12 }} onClick={() => setSeed((s) => s + 1)}>
            Shuffle preview
          </button>
          <button className="btn accent block" onClick={handleGenerate}>
            Generate .html
          </button>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1rem", marginBottom: 12, opacity: 0.75 }}>Live preview</h2>
          <WordSearchPreview
            key={seed}
            words={wordsForPreview}
            rows={rows}
            cols={cols}
            showHints={showHints}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .ws-grid { grid-template-columns: 1fr !important; }
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
