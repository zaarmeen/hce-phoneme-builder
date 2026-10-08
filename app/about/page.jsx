export default function AboutPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 16 }}>About this project</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          The HCE Phoneme Activity Builder helps Speech Pathology teachers create
          phoneme-based Wordle and Word Search activities for their students. Teachers build
          reusable word lists of HCE phoneme transcriptions, turn them into activities, and
          save those activities to come back to next lesson.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          Every activity can be exported as a single, self-contained HTML file that plays
          offline in any standard browser, which matters for classrooms with unreliable
          internet access.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>How the project grew</h2>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7, opacity: 0.9 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Assessment 1:</strong> the frontend, with the Wordle and Word Search
            builders, live previews, the phoneme keyboard and HTML export.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Assessment 2:</strong> a Prisma database, CRUD APIs with validation, a
            health check, and Docker.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Assessment 3:</strong> a usage dashboard with alerts, Playwright
            end-to-end tests, JMeter load testing and Lighthouse accessibility checks.
          </li>
          <li>
            <strong>Assessment 4:</strong> reusable word lists, PostgreSQL running as its own
            Docker service, saving and loading activities inside the builders, and a design
            refresh.
          </li>
        </ol>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Wordle tool</h2>
        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>
          Teachers pick a word list and target word, decide how many guesses students get,
          and toggle hover hints that show each phoneme&apos;s English letter equivalent (for
          example, hovering over /θ/ shows &quot;TH (as in thin)&quot;). The preview is fully
          playable, and the activity can be saved and reopened later.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Word Search tool</h2>
        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>
          Teachers hide a word list in a phoneme grid, adjust the rows and columns, and export
          a drag-to-select word search with the same hover hint support. Saved word lists can
          be shared between Word Search and Wordle activities.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>Student &amp; walkthrough</h2>
        <p style={{ marginBottom: 10 }}>
          Zarmeen — Student No. 22185135
        </p>
        <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: 10 }}>
          A short walkthrough video explaining how to use this site.
        </p>
        <div style={{ aspectRatio: "16/9", borderRadius: 8, overflow: "hidden" }}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/Cnrd7tx6bG0"
            title="Assessment 1 walkthrough video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
