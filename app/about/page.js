export default function AboutPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 16 }}>About this project</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          The HCE Phoneme Activity Builder is a frontend tool for Speech Pathology teachers
          to create phoneme-based Wordle and Word Search activities for their students. It is
          built with Next.js and React as the first stage of a multi-assessment project.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          <strong>Assessment 1 is frontend only.</strong> The Wordle activity currently uses a
          single fixed phoneme word, and the Word Search activity uses a fixed list of five
          phoneme words. There is no database or dynamic word-list management yet — that is
          planned for Assessment 2, where teachers will be able to manage a full word bank and
          rotate through multiple activities automatically.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          Every activity you build here can be exported as a single, self-contained HTML file
          that plays correctly offline in any standard browser, which matters for classrooms
          with unreliable internet access.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Wordle tool</h2>
        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>
          Teachers choose a phoneme word, decide how many guesses students get, and toggle
          hover hints that show each phoneme&apos;s English letter equivalent (for example, hovering
          over /θ/ shows &quot;TH (as in thin)&quot;).
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Word Search tool</h2>
        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>
          Teachers preview a five-word phoneme grid, adjust the rows and columns, and export a
          drag-to-select word search with the same hover hint support.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>Student &amp; walkthrough</h2>
        <p style={{ marginBottom: 10 }}>
          Zarmeen — Student No. 22185135
        </p>
        <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: 10 }}>
          {/* TODO: replace this placeholder with an embedded video (e.g. YouTube unlisted / Panopto) once recorded */}
          A short walkthrough video explaining how to use this site will be embedded here.
        </p>
        <div
          style={{
            aspectRatio: "16/9",
            background: "var(--paper)",
            border: "1px dashed var(--border)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            opacity: 0.6,
          }}
        >
          Video placeholder
        </div>
      </div>
    </div>
  );
}
