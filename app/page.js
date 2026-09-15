import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section style={{ marginBottom: 32 }}>
        <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--secondary)", fontWeight: 700, marginBottom: 8 }}>
          Speech Pathology classroom tool
        </p>
        <h1 style={{ fontSize: "2.2rem", marginBottom: 12 }}>
          Build phoneme-based classroom activities in minutes.
        </h1>
        <p style={{ maxWidth: 620, opacity: 0.8, lineHeight: 1.6 }}>
          This builder lets teachers turn HCE phoneme transcriptions into a playable Wordle
          puzzle or a Word Search activity, then download a single HTML file to run in any
          browser — no installs, no accounts, no internet required for students.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        <Link href="/wordle" style={{ textDecoration: "none" }}>
          <div className="card" style={{ height: "100%" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Wordle Builder</h2>
            <p style={{ opacity: 0.75, fontSize: "0.92rem", lineHeight: 1.5 }}>
              Pick a phoneme target word, set the number of guesses, and preview the game
              before generating it.
            </p>
            <span className="btn" style={{ marginTop: 16 }}>Open Wordle builder</span>
          </div>
        </Link>

        <Link href="/wordsearch" style={{ textDecoration: "none" }}>
          <div className="card" style={{ height: "100%" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Word Search Builder</h2>
            <p style={{ opacity: 0.75, fontSize: "0.92rem", lineHeight: 1.5 }}>
              Preview a five-word phoneme word search, adjust the grid size, and export a
              printable, playable activity.
            </p>
            <span className="btn secondary" style={{ marginTop: 16 }}>Open Word Search builder</span>
          </div>
        </Link>

        <Link href="/about" style={{ textDecoration: "none" }}>
          <div className="card" style={{ height: "100%" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>About this project</h2>
            <p style={{ opacity: 0.75, fontSize: "0.92rem", lineHeight: 1.5 }}>
              What Assessment 1 covers, how the phoneme keyboard works, and a walkthrough
              video.
            </p>
            <span className="btn secondary" style={{ marginTop: 16 }}>Read more</span>
          </div>
        </Link>
      </section>
    </div>
  );
}
