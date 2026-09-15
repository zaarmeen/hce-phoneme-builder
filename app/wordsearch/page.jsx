"use client";

import { useEffect, useState } from "react";
import { WORD_SEARCH_DEFAULT, PHONEME_MAP } from "../../lib/phonemeData";
import { generateWordSearchHtml } from "../../lib/generateWordSearchHtml";
import { getTheme } from "../../lib/themeCookie";
import { listActivitySets } from "../../lib/apiClient";
import WordSearchPreview from "../../components/WordSearchPreview";

const builtinWords = WORD_SEARCH_DEFAULT.map(([display, units]) => ({
  display,
  cleanDisplay: units.join(" "),
  units,
}));

export default function WordSearchPage() {
  const [savedSets, setSavedSets] = useState([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [selectedSetId, setSelectedSetId] = useState("builtin");

  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [showHints, setShowHints] = useState(true);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    listActivitySets()
      .then((sets) => {
        const wsSets = sets.filter((s) => s.type === "WORDSEARCH" && s.words.length > 0);
        setSavedSets(wsSets);
        if (wsSets.length > 0) {
          setSelectedSetId(wsSets[0].id);
          setRows(wsSets[0].rows ?? 10);
          setCols(wsSets[0].cols ?? 10);
          setShowHints(wsSets[0].showHints);
        }
      })
      .catch(() => setSavedSets([]))
      .finally(() => setLoadingSets(false));
  }, []);

  const selectedSavedSet =
    selectedSetId !== "builtin" ? savedSets.find((s) => s.id === selectedSetId) : null;

  const wordsForPreview = selectedSavedSet
    ? selectedSavedSet.words.map((w) => ({
        display: w.text,
        cleanDisplay: w.phonemes.join(" "),
        units: w.phonemes,
      }))
    : builtinWords;

  function handleSetChange(nextId) {
    setSelectedSetId(nextId);
    setSeed((s) => s + 1);
    const set = nextId !== "builtin" ? savedSets.find((s) => s.id === nextId) : null;
    if (set) {
      setRows(set.rows ?? 10);
      setCols(set.cols ?? 10);
      setShowHints(set.showHints);
    }
  }

  function handleGenerate() {
    const html = generateWordSearchHtml({
      words: wordsForPreview,
      phonemeMap: PHONEME_MAP,
      rows,
      cols,
      showHints,
      theme: getTheme(),
    });
    downloadFile("phoneme-word-search.html", html);
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>Word Search Builder</h1>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: 640 }}>
        Pick a saved word list (or the built-in five-word demo), adjust the grid size and
        preview it, then generate a downloadable HTML file. Manage word lists on the{" "}
        <a href="/manage" style={{ textDecoration: "underline" }}>Manage Word Lists</a> page.
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}
        className="ws-grid"
      >
        <div className="card">
          <label className="field-label" htmlFor="wsSourceSet">Word list</label>
          <select
            id="wsSourceSet"
            value={selectedSetId}
            onChange={(e) =>
              handleSetChange(e.target.value === "builtin" ? "builtin" : Number(e.target.value))
            }
            style={{ marginBottom: 16 }}
            disabled={loadingSets}
          >
            <option value="builtin">Built-in demo list (5 words, not saved)</option>
            {savedSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.words.length} words)
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="rows">Rows</label>
          <input
            id="rows"
            type="number"
            min={6}
            max={16}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            style={{ marginBottom: 16 }}
          />
          <label className="field-label" htmlFor="cols">Columns</label>
          <input
            id="cols"
            type="number"
            min={6}
            max={16}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
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

          <button
            className="btn secondary"
            style={{ width: "100%", marginBottom: 10 }}
            onClick={() => setSeed((s) => s + 1)}
          >
            Shuffle preview
          </button>
          <button className="btn accent" style={{ width: "100%" }} onClick={handleGenerate}>
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
