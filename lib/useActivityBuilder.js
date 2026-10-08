"use client";

// Shared save/load logic for the Wordle and Word Search builders, so a teacher can
// open a saved activity, change it, and save it back without leaving the builder.
//
// The hook owns: which saved activity is open (or "new"), its title, which word list
// it uses, and its settings (e.g. maxGuesses or rows/cols, plus showHints). Each
// builder page renders its own type-specific fields and calls the returned helpers.
//
// A specific activity can be opened directly with ?activity=<id> in the URL, which is
// how the "Open in builder" links on the Manage page work.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listActivitySets,
  listWordLists,
  createActivitySet,
  updateActivitySet,
} from "./apiClient";
import { trackEvent } from "./trackEvent";

export const BUILTIN = "builtin";

function settingsFrom(set, defaults) {
  const out = {};
  for (const key of Object.keys(defaults)) {
    out[key] = set[key] ?? defaults[key];
  }
  return out;
}

function setActivityInUrl(id) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("activity", String(id));
  else url.searchParams.delete("activity");
  window.history.replaceState(null, "", url);
}

export function useActivityBuilder({ type, defaultSettings }) {
  const [activities, setActivities] = useState([]);
  const [wordLists, setWordLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [activityId, setActivityId] = useState(null); // null = new, not yet saved
  const [title, setTitle] = useState("");
  const [wordListId, setWordListId] = useState(BUILTIN);
  const [settings, setSettings] = useState(defaultSettings);
  // What was last loaded or saved, to tell whether there are unsaved changes.
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { kind: "success" | "error", message }

  const applyActivity = useCallback(
    (set) => {
      const nextSettings = settingsFrom(set, defaultSettings);
      const nextListId = set.wordListId ?? BUILTIN;
      setActivityId(set.id);
      setTitle(set.title);
      setWordListId(nextListId);
      setSettings(nextSettings);
      setSavedSnapshot({ title: set.title, wordListId: nextListId, settings: nextSettings });
      setActivityInUrl(set.id);
    },
    // defaultSettings is a constant object defined by each page
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    Promise.all([listActivitySets(), listWordLists()])
      .then(([sets, lists]) => {
        const ofType = sets.filter((s) => s.type === type);
        setActivities(ofType);
        setWordLists(lists);

        const requested = Number(new URLSearchParams(window.location.search).get("activity"));
        const toOpen = ofType.find((s) => s.id === requested);
        if (toOpen) {
          applyActivity(toOpen);
        } else {
          // Start a new activity on the first word list that has words, if any.
          const firstUsable = lists.find((l) => l.words.length > 0);
          if (firstUsable) setWordListId(firstUsable.id);
        }
      })
      .catch((err) => {
        // Backend not reachable: the builder still works with the built-in demo words.
        setLoadError(err.message);
      })
      .finally(() => setLoading(false));
  }, [type, applyActivity]);

  const selectedWordList =
    wordListId === BUILTIN ? null : wordLists.find((l) => l.id === wordListId) || null;

  const isDirty = useMemo(() => {
    if (!savedSnapshot) return activityId === null && title.trim() !== "";
    return (
      savedSnapshot.title !== title ||
      savedSnapshot.wordListId !== wordListId ||
      Object.keys(settings).some((k) => String(savedSnapshot.settings[k]) !== String(settings[k]))
    );
  }, [savedSnapshot, activityId, title, wordListId, settings]);

  function openActivity(id) {
    setStatus(null);
    if (id === null) {
      setActivityId(null);
      setTitle("");
      setSettings(defaultSettings);
      setSavedSnapshot(null);
      setActivityInUrl(null);
      return;
    }
    const set = activities.find((s) => s.id === id);
    if (set) applyActivity(set);
  }

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  // Why saving is blocked right now, or null if it's allowed.
  const saveBlocker =
    wordListId === BUILTIN
      ? "Choose a saved word list to save this activity. The built-in demo words can't be saved."
      : title.trim() === ""
      ? "Give the activity a title to save it."
      : null;

  function payload() {
    const numericSettings = {};
    for (const [key, value] of Object.entries(settings)) {
      numericSettings[key] = typeof defaultSettings[key] === "number" ? Number(value) : value;
    }
    return { title: title.trim(), type, wordListId, ...numericSettings };
  }

  async function persist(asNew) {
    if (saveBlocker) {
      setStatus({ kind: "error", message: saveBlocker });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const saved =
        asNew || activityId === null
          ? await createActivitySet(payload())
          : await updateActivitySet(activityId, payload());

      if (asNew || activityId === null) {
        trackEvent({ type: "ACTIVITY_CREATED", activityType: type });
      }
      setActivities((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)]);
      applyActivity(saved);
      setStatus({
        kind: "success",
        message: asNew || activityId === null ? `Saved "${saved.title}" as a new activity.` : "Changes saved.",
      });
    } catch (err) {
      setStatus({ kind: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  return {
    loading,
    loadError,
    activities,
    wordLists,
    activityId,
    title,
    setTitle,
    wordListId,
    setWordListId,
    selectedWordList,
    settings,
    updateSetting,
    openActivity,
    isDirty,
    saving,
    status,
    saveBlocker,
    save: () => persist(false),
    saveAsNew: () => persist(true),
  };
}
