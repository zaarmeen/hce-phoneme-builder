export default function Header() {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.8rem", opacity: 0.6, fontWeight: 600 }}>
          CSE3CWA
        </span>
        <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
          HCE Phoneme Activity Builder
        </span>
      </div>
    </div>
  );
}
