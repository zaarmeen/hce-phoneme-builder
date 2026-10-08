"use client";

// Home page showpiece: a Wordle-style row of tiles that flips over to reveal a word's
// HCE phonemes, then moves on to the next word. It shows what the app is about
// (words as phonemes, played as Wordle) before anyone reads a sentence.
//
// Reuses the .tile styles from globals.css, so it matches the real Wordle preview.
// With reduced motion turned on, it shows one word with no animation.

import { useEffect, useState } from "react";

const WORDS = [
  { text: "ship", phonemes: ["ʃ", "ɪ", "p"] },
  { text: "chin", phonemes: ["tʃ", "ɪ", "n"] },
  { text: "jam", phonemes: ["dʒ", "æ", "m"] },
  { text: "ring", phonemes: ["ɹ", "ɪ", "ŋ"] },
  { text: "boot", phonemes: ["b", "ʉː", "t"] },
  { text: "bait", phonemes: ["b", "æɪ", "t"] },
];

const HOLD_MS = 2600;

export default function PhonemeTileHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), HOLD_MS);
    return () => clearInterval(timer);
  }, []);

  const word = WORDS[index];

  return (
    <figure className="tile-hero" aria-label={`The word "${word.text}" written as phonemes: ${word.phonemes.join(" ")}`}>
      <EmptyRow length={word.phonemes.length} />
      {/* Keyed by word so each new word remounts and replays the flip */}
      <div key={word.text} className="tile-row tile-hero-row" aria-hidden="true">
        {word.phonemes.map((p, i) => (
          <div key={i} className="tile tile-hero-tile" data-state="hit" style={{ "--i": i }}>
            {p}
          </div>
        ))}
      </div>
      <EmptyRow length={word.phonemes.length} />
      <figcaption key={`${word.text}-caption`} className="tile-hero-caption" aria-hidden="true">
        {word.text}
      </figcaption>
    </figure>
  );
}

function EmptyRow({ length }) {
  return (
    <div className="tile-row tile-hero-row tile-hero-empty" aria-hidden="true">
      {Array.from({ length }, (_, i) => (
        <div key={i} className="tile tile-hero-tile" />
      ))}
    </div>
  );
}
