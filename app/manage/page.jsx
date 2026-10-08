"use client";

import { useEffect, useState } from "react";
import PhonemeKeyboard from "../../components/PhonemeKeyboard";
import { trackEvent } from "../../lib/trackEvent";
import {
  listActivitySets,
  createActivitySet,
  updateActivitySet,
  deleteActivitySet,
  listWordLists,
  createWordList,
  updateWordList,
  deleteWordList,
  addWordToList,
  updateWord,
  deleteWord,
} from "../../lib/apiClient";

const EMPTY_NEW_SET = {
  title: "",
  type: "WORDLE",
  wordListId: "",
  difficulty: 3,
  maxGuesses: 6,
  rows: 10,
  cols: 10,
  showHints: true,
  theme: "light",
};

const typeLabel = (type) => (type === "WORDLE" ? "Wordle" : "Word Search");
const builderPath = (set) => `${set.type === "WORDLE" ? "/wordle" : "/wordsearch"}?activity=${set.id}`;

// Two views on one page:
// - Word lists: reusable lists of phoneme words (create, rename, delete, add/edit words)
// - Activities: saved Wordle / Word Search configurations, each pointing at a word list
export default function ManagePage() {
  const [view, setView] = useState("lists");
  const [wordLists, setWordLists] = useState([]);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [selectedListId, setSelectedListId] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [newWord, setNewWord] = useState({ text: "", hint: "", phonemes: [] });
  const [newSet, setNewSet] = useState(EMPTY_NEW_SET);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [lists, activitySets] = await Promise.all([listWordLists(), listActivitySets()]);
      setWordLists(lists);
      setSets(activitySets);
      setSelectedListId((current) =>
        lists.some((l) => l.id === current) ? current : lists[0]?.id ?? null
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Allow linking straight to the activities view, e.g. /manage?view=activities
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "activities") setView("activities");
    refresh();
  }, []);

  // Runs an API action with the shared busy/error handling, then reloads everything.
  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      await refresh();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  const selectedList = wordLists.find((l) => l.id === selectedListId) || null;

  // ---- Word list actions ----

  async function handleCreateList(e) {
    e.preventDefault();
    const created = await run(() => createWordList({ title: newListTitle }));
    if (created) {
      setNewListTitle("");
      setSelectedListId(created.id);
    }
  }

  async function handleRenameList(list) {
    const title = prompt("Word list name:", list.title);
    if (title === null || title.trim() === "") return;
    await run(() => updateWordList(list.id, { title }));
  }

  async function handleDeleteList(list) {
    const usedBy =
      list.activityCount > 0
        ? ` ${list.activityCount} activit${list.activityCount === 1 ? "y uses" : "ies use"} it and will be left without a word list.`
        : "";
    if (!confirm(`Delete "${list.title}" and all of its words?${usedBy}`)) return;
    await run(() => deleteWordList(list.id));
  }

  async function handleAddWord(e) {
    e.preventDefault();
    if (!selectedList) return;
    const created = await run(() =>
      addWordToList(selectedList.id, {
        text: newWord.text,
        hint: newWord.hint || null,
        phonemes: newWord.phonemes,
      })
    );
    if (created) setNewWord({ text: "", hint: "", phonemes: [] });
  }

  async function handleRenameWord(word) {
    const text = prompt("Word text:", word.text);
    if (text === null || text.trim() === "") return;
    await run(() => updateWord(word.id, { text }));
  }

  // ---- Activity actions ----

  async function handleCreateSet(e) {
    e.preventDefault();
    const payload = {
      title: newSet.title,
      type: newSet.type,
      difficulty: Number(newSet.difficulty),
      showHints: newSet.showHints,
      theme: newSet.theme,
      wordListId: newSet.wordListId ? Number(newSet.wordListId) : null,
      ...(newSet.type === "WORDLE" ? { maxGuesses: Number(newSet.maxGuesses) } : {}),
      ...(newSet.type === "WORDSEARCH" ? { rows: Number(newSet.rows), cols: Number(newSet.cols) } : {}),
    };
    const created = await run(() => createActivitySet(payload));
    if (created) {
      trackEvent({ type: "ACTIVITY_CREATED", activityType: created.type });
      setNewSet(EMPTY_NEW_SET);
    }
  }

  async function handleDeleteSet(set) {
    if (!confirm(`Delete the activity "${set.title}"? Its word list is kept.`)) return;
    await run(() => deleteActivitySet(set.id));
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>Manage Word Lists</h1>
      <p style={{ opacity: 0.7, marginBottom: 20, maxWidth: 680 }}>
        Word lists are reusable: build a list of phoneme words once, then use it in as many
        Wordle and Word Search activities as you like. Changes to a list show up in every
        activity that uses it.
      </p>

      <div className="segmented" role="tablist" aria-label="Manage" style={{ marginBottom: 24 }}>
        <button type="button" role="tab" aria-selected={view === "lists"} onClick={() => setView("lists")}>
          Word lists ({wordLists.length})
        </button>
        <button type="button" role="tab" aria-selected={view === "activities"} onClick={() => setView("activities")}>
          Activities ({sets.length})
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)", marginBottom: 20 }}>
          {error}
        </div>
      )}

      {view === "lists" ? (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }} className="manage-grid">
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>New word list</h2>
              <form onSubmit={handleCreateList}>
                <label className="field-label" htmlFor="newListTitle">Name</label>
                <input
                  id="newListTitle"
                  type="text"
                  required
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  style={{ marginBottom: 12 }}
                />
                <button className="btn accent block" type="submit" disabled={busy}>
                  Create word list
                </button>
              </form>
            </div>

            <div className="card">
              <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Saved word lists</h2>
              {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
              {!loading && wordLists.length === 0 && (
                <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>No word lists yet. Create one above.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {wordLists.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedListId(l.id)}
                    className={l.id === selectedListId ? "btn" : "btn secondary"}
                    style={{ justifyContent: "flex-start", textAlign: "left" }}
                  >
                    <span>
                      {l.title}{" "}
                      <span style={{ opacity: 0.7, fontWeight: 400 }}>
                        ({l.words.length} words, used by {l.activityCount})
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            {!selectedList && !loading && (
              <div className="card">
                <p style={{ opacity: 0.7 }}>Select or create a word list to manage its words.</p>
              </div>
            )}

            {selectedList && (
              <>
                <div className="card" style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <h2 style={{ fontSize: "1.2rem", marginBottom: 4 }}>{selectedList.title}</h2>
                      <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: 0 }}>
                        {selectedList.words.length} words · used by{" "}
                        {selectedList.activityCount === 1 ? "1 activity" : `${selectedList.activityCount} activities`}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn secondary" type="button" disabled={busy} onClick={() => handleRenameList(selectedList)}>
                        Rename list
                      </button>
                      <button
                        className="btn secondary danger"
                        type="button"
                        disabled={busy}
                        
                        onClick={() => handleDeleteList(selectedList)}
                      >
                        Delete list
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Words</h3>
                  {selectedList.words.length === 0 && (
                    <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>No words yet. Add one below.</p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedList.words.map((w) => (
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
                          <span style={{ fontFamily: "var(--font-mono)", opacity: 0.75 }}>{w.phonemes.join(" ")}</span>
                          {w.hint && <span style={{ opacity: 0.6, fontSize: "0.85rem" }}> ({w.hint})</span>}
                        </span>
                        <span style={{ display: "flex", gap: 6 }}>
                          <button className="btn secondary" type="button" disabled={busy} onClick={() => handleRenameWord(w)}>
                            Rename
                          </button>
                          <button
                            className="btn secondary danger"
                            type="button"
                            disabled={busy}
                            
                            onClick={() => run(() => deleteWord(w.id))}
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

                    <label className="field-label">Phoneme sequence: tap symbols in order</label>
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
                      {newWord.phonemes.length === 0 && <span style={{ opacity: 0.5 }}>No phonemes selected yet</span>}
                      {newWord.phonemes.map((p, i) => (
                        <span
                          key={i}
                          style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 8px" }}
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
                        onClick={() => setNewWord({ ...newWord, phonemes: newWord.phonemes.slice(0, -1) })}
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
                      onSelect={(ipa) => setNewWord((prev) => ({ ...prev, phonemes: [...prev.phonemes, ipa] }))}
                    />

                    <button
                      className="btn accent block"
                      type="submit"
                      disabled={busy || newWord.phonemes.length === 0}
                      style={{ marginTop: 16 }}
                    >
                      Add word to list
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }} className="manage-grid">
          <div className="card" style={{ alignSelf: "start" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>New activity</h2>
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

              <label className="field-label" htmlFor="newWordList">Word list</label>
              <select
                id="newWordList"
                value={newSet.wordListId}
                onChange={(e) => setNewSet({ ...newSet, wordListId: e.target.value })}
                style={{ marginBottom: 12 }}
              >
                <option value="">No word list yet</option>
                {wordLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.words.length} words)
                  </option>
                ))}
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

              <button className="btn accent block" type="submit" disabled={busy}>
                Create activity
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Saved activities</h2>
            {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
            {!loading && sets.length === 0 && (
              <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>No activities yet. Create one on the left.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sets.map((s) => (
                <div
                  key={s.id}
                  data-testid="activity-row"
                  style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong>{s.title}</strong>
                      <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                        {typeLabel(s.type)} ·{" "}
                        {s.type === "WORDLE" ? `${s.maxGuesses} guesses` : `${s.rows}×${s.cols} grid`} · hints{" "}
                        {s.showHints ? "on" : "off"} · {s.words.length} words
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "start", flexWrap: "wrap" }}>
                      <a className="btn" href={builderPath(s)}>Open in builder</a>
                      <button
                        className="btn secondary"
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => updateActivitySet(s.id, { showHints: !s.showHints }))}
                      >
                        Toggle hints
                      </button>
                      <button
                        className="btn secondary danger"
                        type="button"
                        disabled={busy}
                        
                        onClick={() => handleDeleteSet(s)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: "0.85rem" }}>
                    <span style={{ opacity: 0.7, whiteSpace: "nowrap" }}>Word list:</span>
                    <select
                      aria-label={`Word list for ${s.title}`}
                      value={s.wordListId ?? ""}
                      disabled={busy}
                      onChange={(e) =>
                        run(() =>
                          updateActivitySet(s.id, { wordListId: e.target.value ? Number(e.target.value) : null })
                        )
                      }
                    >
                      <option value="">No word list</option>
                      {wordLists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title} ({l.words.length} words)
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .manage-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
