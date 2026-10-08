// Shared validation for the Activity Set / Word / Phoneme API routes.
// Every function returns a plain array of human-readable error strings.
// An empty array means the input is valid. Nothing here throws — callers
// decide what HTTP status to send back.

import { PHONEME_MAP } from "./phonemeData";

const VALID_TYPES = ["WORDLE", "WORDSEARCH"];
const VALID_THEMES = ["light", "dark"];
const VALID_EVENT_TYPES = [
  "ACTIVITY_CREATED",
  "PAGE_VIEW",
  "GENERATION_SUCCESS",
  "GENERATION_FAILURE",
];

export function validateActivitySetInput(data, { partial = false } = {}) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return ["Request body must be a JSON object."];
  }

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.push("title is required and must be a non-empty string.");
    } else if (data.title.trim().length > 120) {
      errors.push("title must be 120 characters or fewer.");
    }
  }

  if (!partial || data.type !== undefined) {
    if (!VALID_TYPES.includes(data.type)) {
      errors.push(`type must be one of: ${VALID_TYPES.join(", ")}.`);
    }
  }

  if (data.difficulty !== undefined) {
    const d = Number(data.difficulty);
    if (!Number.isInteger(d) || d < 1 || d > 8) {
      errors.push("difficulty must be an integer between 1 and 8.");
    }
  }

  if (data.maxGuesses !== undefined && data.maxGuesses !== null) {
    const g = Number(data.maxGuesses);
    if (!Number.isInteger(g) || g < 3 || g > 10) {
      errors.push("maxGuesses must be an integer between 3 and 10.");
    }
  }

  if (data.rows !== undefined && data.rows !== null) {
    const r = Number(data.rows);
    if (!Number.isInteger(r) || r < 6 || r > 16) {
      errors.push("rows must be an integer between 6 and 16.");
    }
  }

  if (data.cols !== undefined && data.cols !== null) {
    const c = Number(data.cols);
    if (!Number.isInteger(c) || c < 6 || c > 16) {
      errors.push("cols must be an integer between 6 and 16.");
    }
  }

  if (data.showHints !== undefined && typeof data.showHints !== "boolean") {
    errors.push("showHints must be a boolean.");
  }

  if (data.theme !== undefined && !VALID_THEMES.includes(data.theme)) {
    errors.push(`theme must be one of: ${VALID_THEMES.join(", ")}.`);
  }

  if (data.wordListId !== undefined && data.wordListId !== null) {
    const id = Number(data.wordListId);
    if (!Number.isInteger(id) || id < 1) {
      errors.push("wordListId must be a positive integer or null.");
    }
  }

  // Cross-field checks: a Word Search set needs rows/cols, a Wordle set needs maxGuesses.
  if (data.type === "WORDSEARCH" && (data.rows === undefined || data.cols === undefined) && !partial) {
    errors.push("rows and cols are required when type is WORDSEARCH.");
  }
  if (data.type === "WORDLE" && data.maxGuesses === undefined && !partial) {
    errors.push("maxGuesses is required when type is WORDLE.");
  }

  return errors;
}

export function validateWordListInput(data, { partial = false } = {}) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return ["Request body must be a JSON object."];
  }

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.push("title is required and must be a non-empty string.");
    } else if (data.title.trim().length > 120) {
      errors.push("title must be 120 characters or fewer.");
    }
  }

  return errors;
}

// Validates a usage/observability event before it's written to the Event table
// (see "Assessment 3: observability / reporting" in prisma/schema.prisma). Kept
// deliberately lax compared to validateActivitySetInput/validateWordInput — this
// is telemetry, not user content, so the bar is "well-formed enough to aggregate
// safely," not "exactly matches a strict content model."
export function validateEventInput(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return ["Request body must be a JSON object."];
  }

  if (!VALID_EVENT_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${VALID_EVENT_TYPES.join(", ")}.`);
  }

  if (data.activityType !== undefined && data.activityType !== null && !VALID_TYPES.includes(data.activityType)) {
    errors.push(`activityType must be one of: ${VALID_TYPES.join(", ")}.`);
  }

  if (data.page !== undefined && data.page !== null) {
    if (typeof data.page !== "string" || data.page.length > 200) {
      errors.push("page must be a string of 200 characters or fewer.");
    }
  }

  if (data.durationMs !== undefined && data.durationMs !== null) {
    const d = Number(data.durationMs);
    if (!Number.isFinite(d) || d < 0 || d > 1000 * 60 * 60 * 24) {
      errors.push("durationMs must be a non-negative number of milliseconds (max 24h).");
    }
  }

  if (data.reason !== undefined && data.reason !== null) {
    if (typeof data.reason !== "string" || data.reason.length > 100) {
      errors.push("reason must be a string of 100 characters or fewer.");
    }
  }

  return errors;
}

export function validateWordInput(data, { partial = false } = {}) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return ["Request body must be a JSON object."];
  }

  if (!partial || data.text !== undefined) {
    if (typeof data.text !== "string" || data.text.trim().length === 0) {
      errors.push("text is required and must be a non-empty string.");
    } else if (data.text.trim().length > 60) {
      errors.push("text must be 60 characters or fewer.");
    }
  }

  if (data.hint !== undefined && data.hint !== null) {
    if (typeof data.hint !== "string" || data.hint.length > 200) {
      errors.push("hint must be a string of 200 characters or fewer.");
    }
  }

  if (data.position !== undefined) {
    if (!Number.isInteger(Number(data.position)) || Number(data.position) < 0) {
      errors.push("position must be a non-negative integer.");
    }
  }

  if (!partial || data.phonemes !== undefined) {
    if (!Array.isArray(data.phonemes) || data.phonemes.length === 0) {
      errors.push("phonemes is required and must be a non-empty array of phoneme symbols.");
    } else if (data.phonemes.length > 8) {
      errors.push("phonemes cannot contain more than 8 units.");
    } else {
      const badUnits = data.phonemes.filter(
        (p) => typeof p !== "string" || p.length === 0
      );
      if (badUnits.length > 0) {
        errors.push("Every phoneme unit must be a non-empty string.");
      }
      const unknownUnits = data.phonemes.filter(
        (p) => typeof p === "string" && p.length > 0 && !(p in PHONEME_MAP)
      );
      if (unknownUnits.length > 0) {
        errors.push(
          `Unrecognised phoneme symbol(s): ${unknownUnits.join(", ")}. Use a symbol from the HCE phoneme keyboard.`
        );
      }
    }
  }

  return errors;
}
