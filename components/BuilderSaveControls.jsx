"use client";

// UI pieces shared by the Wordle and Word Search builders for loading and saving
// activities. Both take the object returned by useActivityBuilder().

import { BUILTIN } from "../lib/useActivityBuilder";

// Top of the builder: which saved activity is open, its title, and its word list.
export function ActivityPicker({ builder, builtinLabel }) {
  const {
    loading,
    loadError,
    activities,
    wordLists,
    activityId,
    title,
    setTitle,
    wordListId,
    setWordListId,
    openActivity,
  } = builder;

  return (
    <>
      <label className="field-label" htmlFor="activityPicker">Saved activity</label>
      <select
        id="activityPicker"
        value={activityId ?? "new"}
        onChange={(e) => openActivity(e.target.value === "new" ? null : Number(e.target.value))}
        style={{ marginBottom: 16 }}
        disabled={loading || !!loadError}
      >
        <option value="new">New activity (not saved yet)</option>
        {activities.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="activityTitle">Activity title</label>
      <input
        id="activityTitle"
        type="text"
        value={title}
        placeholder="e.g. Week 3 /tʃ/ practice"
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: 16 }}
        maxLength={120}
      />

      <label className="field-label" htmlFor="sourceSet">Word list</label>
      <select
        id="sourceSet"
        value={wordListId}
        onChange={(e) => setWordListId(e.target.value === BUILTIN ? BUILTIN : Number(e.target.value))}
        style={{ marginBottom: loadError ? 8 : 16 }}
        disabled={loading}
      >
        <option value={BUILTIN}>{builtinLabel}</option>
        {wordLists.map((l) => (
          <option key={l.id} value={l.id} disabled={l.words.length === 0}>
            {l.title} ({l.words.length === 0 ? "empty" : `${l.words.length} words`})
          </option>
        ))}
      </select>
      {loadError && (
        <p style={{ fontSize: "0.85rem", color: "var(--danger)", marginBottom: 16 }}>
          Couldn't load saved activities ({loadError}). Using the built-in words.
        </p>
      )}
    </>
  );
}

// Bottom of the builder: save buttons and the result of the last save.
export function SaveButtons({ builder }) {
  const { activityId, isDirty, saving, status, saveBlocker, save, saveAsNew } = builder;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {activityId !== null && (
          <button
            type="button"
            className="btn"
            style={{ flex: 1 }}
            disabled={saving || !isDirty || !!saveBlocker}
            onClick={save}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        )}
        <button
          type="button"
          className="btn secondary"
          style={{ flex: 1 }}
          disabled={saving || !!saveBlocker}
          onClick={saveAsNew}
        >
          {activityId === null ? "Save activity" : "Save as new"}
        </button>
      </div>

      <p role="status" style={{ fontSize: "0.85rem", marginTop: 8, marginBottom: 0, minHeight: "1.2em" }}>
        {status ? (
          <span style={{ color: status.kind === "error" ? "var(--danger)" : "inherit" }}>{status.message}</span>
        ) : saveBlocker ? (
          <span style={{ opacity: 0.7 }}>{saveBlocker}</span>
        ) : isDirty ? (
          <span style={{ opacity: 0.7 }}>Unsaved changes</span>
        ) : null}
      </p>
    </div>
  );
}
