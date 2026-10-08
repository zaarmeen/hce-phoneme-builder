export default function AboutPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 16 }}>About this project</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          I built this tool for Speech Pathology teachers who want their students to practise
          HCE phonemes in a way that feels like a game. You type up a list of words once using
          the phoneme keyboard, then turn that list into a Wordle or a Word Search. Activities
          are saved, so you can pick up where you left off next lesson.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          Every activity downloads as a single HTML file. Students can open it in any browser,
          even without internet, which helps in classrooms where the Wi-Fi isn&apos;t reliable.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>How it came together</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 10, opacity: 0.9 }}>
          The project grew across the CSE3CWA assessments:
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7, opacity: 0.9 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Assessment 1, frontend design and usability:</strong> I started with the frontend: the two
            builders, live previews, the phoneme keyboard and the HTML export.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Assessment 2, full-stack application:</strong> I added a database with Prisma, an API for
            creating and editing activities, a health check, and Docker.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Assessment 3, practical demonstration:</strong> I added a dashboard to see how the app is
            being used, plus Playwright tests, JMeter load testing and Lighthouse accessibility
            checks, and walked through it all in a video.
          </li>
          <li>
            <strong>Since then:</strong> acting on my feedback, I made word lists reusable,
            moved the database to PostgreSQL as its own Docker service, added saving and
            loading inside the builders, and refreshed the design.
          </li>
        </ol>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Wordle tool</h2>
        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>
          Pick a word list and a target word, choose how many guesses students get, and decide
          whether to show hints. With hints on, students can hover over a phoneme to see its
          English letters, so /θ/ shows &quot;TH (as in thin)&quot;. You can play the preview
          yourself before saving or downloading it.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>The Word Search tool</h2>
        <p style={{ lineHeight: 1.7, opacity: 0.85 }}>
          Choose a word list, set the grid size, and download a word search that students solve
          by dragging across the phonemes. It has the same hover hints, and any word list works
          for both games.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>Student &amp; walkthrough</h2>
        <p style={{ marginBottom: 10 }}>
          Zarmeen Obaid, Student No. 22185135
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
