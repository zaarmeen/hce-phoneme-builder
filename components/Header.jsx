export default function Header() {
  return (
    <div
      style={{
        background: "var(--primary)",
        color: "var(--primary-ink)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "6px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.8rem", opacity: 0.85, fontWeight: 600 }}>
          CSE3CWA
        </span>
        <span className="topbar-tagline" style={{ fontSize: "0.8rem", opacity: 0.85 }}>
          Phoneme activities for Speech Pathology classrooms
        </span>
      </div>
    </div>
  );
}
