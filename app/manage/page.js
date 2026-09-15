"use client";

import { useEffect, useState } from "react";
import PhonemeKeyboard from "../../components/PhonemeKeyboard";
import {
  listActivitySets,
  createActivitySet,
  updateActivitySet,
  deleteActivitySet,
  addWord,
  updateWord,
  deleteWord,
} from "../../lib/apiClient";

const EMPTY_NEW_SET = {
  title: "",
  type: "WORDLE",
  difficulty: 3,
  maxGuesses: 6,
  rows: 10,
  cols: 10,
  showHints: true,
  theme: "light",
};

export default function ManagePage() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [newSet, setNewSet] = useState(EMPTY_NEW_SET);
  const [newWord, setNewWord] = useState({ text: "", hint: "", phonemes: [] });
  const [busy, setBusy] = useState(false);

  async function refresh(keepSelected = true) {
    setLoading(true);
    setError(null);
    try {
      const data = await listActivitySets();
      setSets(data);
      if (!keepSelected || !data.some((s) => s.id === selectedId)) {
        setSelectedId(data[0]?.id ?? null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSet = sets.find((s) => s.id === selectedId) || null;

  async function handleCreateSet(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        title: newSet.title,
        type: newSet.type,
        difficulty: Number(newSet.difficulty),
        showHints: newSet.showHints,
        theme: newSet.theme,
        ...(newSet.type === "WORDLE" ? { maxGuesses: Number(newSet.maxGuesses) } : {}),
        ...(newSet.type === "WORDSEARCH"
          ? { rows: Number(newSet.rows), cols: Number(newSet.cols) }
          : {}),
      };
      const created = await createActivitySet(payload);
      setNewSet(EMPTY_NEW_SET);
      await refresh(false);
      setSelectedId(created.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteSet(id) {
    if (!confirm("Delete this activity set and all of its words?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteActivitySet(id);
      await refresh(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddWord(e) {
    e.preventDefault();
    if (!selectedSet) return;
    setBusy(true);
    setError(null);
    try {
      await addWord(selectedSet.id, {
        text: newWord.text,
        hint: newWord.hint || null,
        phonemes: newWord.phonemes,
      });
      setNewWord({ text: "", hint: "", phonemes: [] });
      await refresh(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteWord(id) {
    setBusy(true);
    setError(null);
    try {
      await deleteWord(id);
      await refresh(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRenameWord(word) {
    const text = prompt("Word text:", word.text);
    if (text === null || text.trim() === "") return;
    setBusy(true);
    setError(null);
    try {
      await updateWord(word.id, { text });
      await refresh(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleHints(set) {
    setBusy(true);
    setError(null);
    try {
      await updateActivitySet(set.id, { showHints: !set.showHints });
      await refresh(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>Manage Word Lists</h1>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: 640 }}>
        Create, edit, and delete phoneme word lists and activity settings. The Wordle and
        Word Search builders read their word lists from here once at least one set exists.
      </p>

      {error && (
        <div
          className="card"
          style={{ borderColor: "var(--danger)", color: "var(--danger)", marginBottom: 20 }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }} className="manage-grid">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>New activity set</h2>
            <form onSubmit={handleCreateSet}>
              <label className="field-label" htmlFor="newTitle">Title</label>
              <input
                id="newTitle"
                type="text"
                required
                value={newSet.title}
                onChange={(e) => setNewSet({ ...newSet, title: e.target.value })}
                style={{ marginBottom: 12 }}
              />

              <label className="field-label" htmlFor="newType">Type</label>
              <select
                id="newType"
                value={newSet.type}
                onChange={(e) => setNewSet({ ...newSet, type: e.target.value })}
                style={{ marginBottom: 12 }}
              >
                <option value="WORDLE">Wordle</option>
                <option value="WORDSEARCH">Word Search</option>
              </select>

              <label className="field-label" htmlFor="newDifficulty">Difficulty (phoneme count)</label>
              <input
                id="newDifficulty"
                type="number"
                min={1}
                max={8}
                value={newSet.difficulty}
                onChange={(e) => setNewSet({ ...newSet, difficulty: e.target.value })}
                style={{ marginBottom: 12 }}
              />

              {newSet.type === "WORDLE" ? (
                <>
                  <label className="field-label" htmlFor="newMaxGuesses">Max guesses</label>
                  <input
                    id="newMaxGuesses"
                    type="number"
                    min={3}
                    max={10}
                    value={newSet.maxGuesses}
                    onChange={(e) => setNewSet({ ...newSet, maxGuesses: e.target.value })}
                    style={{ marginBottom: 12 }}
                  />
                </>
              ) : (
                <>
                  <label className="field-label" htmlFor="newRows">Rows</label>
                  <input
                    id="newRows"
                    type="number"
                    min={6}
                    max={16}
                    value={newSet.rows}
                    onChange={(e) => setNewSet({ ...newSet, rows: e.target.value })}
                    style={{ marginBottom: 12 }}
                  />
                  <label className="field-label" htmlFor="newCols">Columns</label>
                  <input
                    id="newCols"
                    type="number"
                    min={6}
                    max={16}
                    value={newSet.cols}
                    onChange={(e) => setNewSet({ ...newSet, cols: e.target.value })}
                    style={{ marginBottom: 12 }}
                  />
                </>
              )}

              <button className="btn accent" type="submit" disabled={busy} style={{ width: "100%" }}>
                Create activity set
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Saved sets</h2>
            {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
            {!loading && sets.length === 0 && (
              <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                No activity sets yet — create one on the left.
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sets.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={s.id === selectedId ? "btn" : "btn secondary"}
                  style={{ justifyContent: "space-between", textAlign: "left" }}
                >
                  <span>
                    {s.title}{" "}
                    <span style={{ opacity: 0.7, fontWeight: 400 }}>
                      ({s.type === "WORDLE" ? "Wordle" : "Word Search"}, {s.words.length} words)
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {!selectedSet && !loading && (
            <div className="card">
              <p style={{ opacity: 0.7 }}>Select or create an activity set to manage its words.</p>
            </div>
          )}

          {selectedSet && (
            <>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: 4 }}>{selectedSet.title}</h2>
                    <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: 0 }}>
                      {selectedSet.type === "WORDLE"
                        ? `Wordle · ${selectedSet.maxGuesses} guesses`
                        : `Word Search · ${selectedSet.rows}×${selectedSet.cols} grid`}{" "}
                      · hints {selectedSet.showHints ? "on" : "off"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggleHints(selectedSet)}
                    >
                      Toggle hints
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      disabled={busy}
                      style={{ color: "var(--danger)" }}
                      onClick={() => handleDeleteSet(selectedSet.id)}
                    >
                      Delete set
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Words</h3>
                {selectedSet.words.length === 0 && (
                  <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>No words yet — add one below.</p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedSet.words.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 12px",
                      }}
                    >
                      <span>
                        <strong>{w.text}</strong>{" "}
                        <span style={{ fontFamily: "var(--font-mono)", opacity: 0.75 }}>
                          {w.phonemes.join(" ")}
                        </span>
                        {w.hint && (
                          <span style={{ opacity: 0.6, fontSize: "0.85rem" }}> — {w.hint}</span>
                        )}
                      </span>
                      <span style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn secondary"
                          type="button"
                          disabled={busy}
                          onClick={() => handleRenameWord(w)}
                        >
                          Rename
                        </button>
                        <button
                          className="btn secondary"
                          type="button"
                          disabled={busy}
                          style={{ color: "var(--danger)" }}
                          onClick={() => handleDeleteWord(w.id)}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Add a word</h3>
                <form onSubmit={handleAddWord}>
                  <label className="field-label" htmlFor="wordText">English word</label>
                  <input
                    id="wordText"
                    type="text"
                    required
                    value={newWord.text}
                    onChange={(e) => setNewWord({ ...newWord, text: e.target.value })}
                    style={{ marginBottom: 12 }}
                  />

                  <label className="field-label" htmlFor="wordHint">Hint (optional)</label>
                  <input
                    id="wordHint"
                    type="text"
                    value={newWord.hint}
                    onChange={(e) => setNewWord({ ...newWord, hint: e.target.value })}
                    style={{ marginBottom: 12 }}
                  />

                  <label className="field-label">
                    Phoneme sequence — tap symbols in order
                  </label>
                  <div
                    style={{
                      minHeight: 40,
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontFamily: "var(--font-mono)",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {newWord.phonemes.length === 0 && (
                      <span style={{ opacity: 0.5 }}>No phonemes selected yet</span>
                    )}
                    {newWord.phonemes.map((p, i) => (
                      <span
                        key={i}
                        style={{
                          background: "var(--paper)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "2px 8px",
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <button
                      type="button"
                      className="btn secondary"
                      disabled={newWord.phonemes.length === 0}
                      onClick={() =>
                        setNewWord({ ...newWord, phonemes: newWord.phonemes.slice(0, -1) })
                      }
                    >
                      Remove last
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      disabled={newWord.phonemes.length === 0}
                      onClick={() => setNewWord({ ...newWord, phonemes: [] })}
                    >
                      Clear
                    </button>
                  </div>

                  <PhonemeKeyboard
                    onSelect={(ipa) =>
                      setNewWord((prev) => ({ ...prev, phonemes: [...prev.phonemes, ipa] }))
                    }
                  />

                  <button
                    className="btn accent"
                    type="submit"
                    disabled={busy || newWord.phonemes.length === 0}
                    style={{ width: "100%", marginTop: 16 }}
                  >
                    Add word to set
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .manage-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
