import Link from "next/link";
import PhonemeTileHero from "../components/PhonemeTileHero";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div>
          <h1 className="hero-title">Build phoneme-based classroom activities in minutes.</h1>
          <p className="hero-lead">
            Turn HCE phoneme transcriptions into a playable Wordle puzzle or a Word Search,
            then download a single HTML file that runs in any browser. No installs, no
            accounts, and no internet needed for students.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/wordle" className="btn">Open Wordle builder</Link>
            <Link href="/manage" className="btn secondary">Manage word lists</Link>
          </div>
        </div>
        <PhonemeTileHero />
      </section>

      <section className="home-links">
        <Link href="/wordle" className="card link-card">
          <h2>Wordle builder</h2>
          <p>Pick a target word, set the number of guesses, play it in the preview, and save it for next lesson.</p>
        </Link>
        <Link href="/wordsearch" className="card link-card">
          <h2>Word Search builder</h2>
          <p>Hide a word list in a phoneme grid, choose the grid size, and export a printable, playable activity.</p>
        </Link>
        <Link href="/manage" className="card link-card">
          <h2>Word lists</h2>
          <p>Build a list of phoneme words once and reuse it across as many activities as you like.</p>
        </Link>
      </section>
    </div>
  );
}
