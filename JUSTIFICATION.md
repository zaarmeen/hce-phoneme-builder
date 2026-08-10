\# Written Justification — Assessment 1



\*\*Zarmeen Obaid — Student No. 22185135\*\*

\*\*CSE3CWA — HCE Phoneme Activity Builder\*\*



\## Design decisions



The interface deliberately avoids the generic "AI tool" look — cream backgrounds, terracotta

accents — in favour of a teal-and-amber palette with a serif display face for headings and a

monospace face for phoneme symbols. Monospacing keeps IPA characters visually aligned and easy

to scan, which matters when two similar symbols (e.g. /d/ and /ð/) sit next to each other on

the keyboard or in a guess row. The layout follows a builder-plus-preview pattern on both the

Wordle and Word Search pages: settings on the left, a fully playable live preview on the right,

so a teacher can see and test the exact activity before generating anything.



\## Component structure and scalability



The application is split into small, single-purpose components: `Header`, `NavBar` (including

the hamburger menu), `Footer`, `PhonemeKeyboard`, `WordlePreview`, and `WordSearchPreview`. Each

page composes these rather than duplicating markup. All phoneme and word-bank data lives in one

file, `lib/phonemeData.js`, completely separate from the UI layer, and the standalone HTML

export logic lives in its own `lib/generateWordleHtml.js` and `lib/generateWordSearchHtml.js`

files. This separation is deliberate: Assessment 2 introduces a database and dynamic

word-list management, and `phonemeData.js` is the intended seam where a database call replaces

a static import, without any component needing to change.



\## Usability considerations



The design follows several of Nielsen's usability heuristics (Nielsen, 1994). Visibility of

system status is handled by the live preview updating immediately after every guess, with

colour-coded feedback (hit / present / miss) matching the familiar Wordle pattern. Error

prevention is handled by disabling or blocking submission until a guess has the correct number

of phonemes, and by keeping the Generate button's output tied directly to the current preview

state, so what a teacher sees is what gets exported. Match between system and the real world is

supported by using a familiar Wordle-style interaction for an unfamiliar (phoneme-based)

alphabet, reducing the learning curve to just the symbols themselves.



\## Accessibility considerations



Accessibility follows the current Web Content Accessibility Guidelines (World Wide Web

Consortium, 2023). All interactive elements are real `<button>` and `<input>` elements, so they

are reachable and operable by keyboard (Tab to move focus, Enter/Space to activate), and visible

focus outlines are styled explicitly rather than removed. Form inputs use associated `<label>`

elements via `htmlFor`/`id` pairs. Colour is never the only carrier of meaning: the phoneme hint

tooltips carry the English-letter equivalent as text (e.g. "TH (as in thin)"), not just a colour

change, and the hamburger menu button includes `aria-label` and `aria-expanded` attributes for

screen reader users. Phoneme selection is optimised for click/tap rather than physical-keyboard

typing, since IPA symbols do not map onto a standard keyboard layout; this is a deliberate,

documented trade-off rather than an oversight.



\## Trade-offs



The most significant trade-off in this stage is fixing the Wordle target word and Word Search

word list rather than allowing free-text entry. This constrains flexibility now, but keeps every

phoneme transcription linguistically accurate against the supplied corpus, which matters more at

this stage than open-ended input. A 2025 study on digital gaming interventions for phonological

awareness (Altındağ Kumaş et al., 2025) supports the idea that consistent, correctly-structured

phoneme content is more valuable to early learners than flexibility. Free-text word entry, a

database, and dynamic rotation between multiple words are explicitly scoped for Assessment 2.



\## How this supports Speech Pathology students and teachers



For teachers, the builder removes the manual work of constructing a phoneme puzzle by hand —

choose a word or word list, adjust settings, preview, and generate a ready-to-use file that runs

offline in any browser, which matters in classrooms with unreliable internet access. For

students, mapping each phoneme symbol to its English letter equivalent on request (via hover or

tap) directly supports the phoneme-to-grapheme correspondence skill that is central to speech

pathology instruction, while the Wordle and Word Search formats keep the task in a familiar,

low-pressure game format.



\## References



Altındağ Kumaş, Ö., Delimehmet Dada, Ş., \& Sümer Dodur, H. M. (2025). Enhancing phonological

awareness skills in students with intellectual disability through digital gaming intervention.

\*Journal of Computer Assisted Learning, 41\*(3), e70038. https://doi.org/10.1111/jcal.70038



Meta Platforms, Inc. (n.d.). \*React documentation\*. https://react.dev



Nielsen, J. (1994). \*10 usability heuristics for user interface design\*. Nielsen Norman Group.

https://www.nngroup.com/articles/ten-usability-heuristics/



Vercel Inc. (n.d.). \*Next.js documentation\*. https://nextjs.org/docs



World Wide Web Consortium. (2023). \*Web Content Accessibility Guidelines (WCAG) 2.2\*.

https://www.w3.org/TR/WCAG22/

