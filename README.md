# HCE Phoneme Activity Builder — Assessment 1

A Next.js frontend for building phoneme-based Wordle and Word Search classroom activities
for Speech Pathology students. Built to the CSE3CWA Assessment 1 brief: frontend design and
usability only, no database yet.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Pages

- `/` — Home, project intro and links
- `/about` — Project description, scope note, student number, video placeholder
- `/wordle` — Wordle builder: pick difficulty/word, hints, guesses, live preview, generate HTML
- `/wordsearch` — Word Search builder: fixed 5-word list, grid size, live preview, generate HTML
- `/settings` — Light/dark theme (cookie) and layout density (cookie)

## Structure

```
app/            Next.js app-router pages
components/     Header, NavBar (hamburger menu), Footer, PhonemeKeyboard,
                WordlePreview, WordSearchPreview, ThemeInit
lib/            phonemeData.js (corpus), generateWordleHtml.js, generateWordSearchHtml.js
                (standalone HTML exporters), wordSearchEngine.js, themeCookie.js
```




