"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/wordle", label: "Wordle" },
  { href: "/wordsearch", label: "Word Search" },
];

const MENU_LINKS = [
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "var(--primary)",
        color: "var(--primary-ink)",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.1rem" }}>
            HCE Phoneme Builder
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div className="nav-links" style={{ display: "flex", gap: 4 }}>
            {PRIMARY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  background: pathname === l.href ? "rgba(255,255,255,0.18)" : "transparent",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <button
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ width: 20, height: 2, background: "currentColor", display: "block" }} />
            <span style={{ width: 20, height: 2, background: "currentColor", display: "block" }} />
            <span style={{ width: 20, height: 2, background: "currentColor", display: "block" }} />
          </button>
        </div>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 20,
            top: "100%",
            background: "var(--surface)",
            color: "var(--ink)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "var(--shadow)",
            padding: 8,
            minWidth: 180,
            zIndex: 20,
          }}
        >
          {/* on small screens the primary links also collapse in here via CSS below */}
          <div className="menu-primary-mobile">
            {PRIMARY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  padding: "8px 10px",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", margin: "6px 0" }} />
          </div>
          {MENU_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: "0.9rem",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
        }
        @media (min-width: 641px) {
          .menu-primary-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
