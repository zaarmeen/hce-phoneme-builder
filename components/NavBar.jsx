"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Small line icons, drawn to match each page's job. They use currentColor so they
// follow the link's colour in light mode, dark mode and the active state.
const ICONS = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  wordle: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  lists: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.2" />
      <circle cx="4.5" cy="12" r="1.2" />
      <circle cx="4.5" cy="18" r="1.2" />
    </>
  ),
  dashboard: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  about: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  // Sliders: reads as "adjust settings" and can't be mistaken for a light-mode toggle
  settings: (
    <>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <svg
      className="nav-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const PRIMARY_LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/wordle", label: "Wordle", icon: "wordle" },
  { href: "/wordsearch", label: "Word Search", icon: "search" },
  { href: "/manage", label: "Word Lists", icon: "lists" },
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
];

const MENU_LINKS = [
  { href: "/about", label: "About", icon: "about" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);

  // Close the menu on navigation, on Escape, and when clicking anywhere outside it.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          {/* The logo is a single Wordle tile holding a phoneme */}
          <span className="nav-logo" aria-hidden="true">ʃ</span>
          HCE Phoneme Builder
        </Link>

        <div className="nav-links">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              <Icon name={l.icon} />
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-tools" ref={menuRef}>
          <Link
            href="/settings"
            className="nav-icon-button nav-settings"
            aria-label="Settings"
            title="Settings"
            aria-current={isActive("/settings") ? "page" : undefined}
          >
            <Icon name="settings" />
          </Link>

          <button
            type="button"
            className="nav-icon-button nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-menu"
            data-open={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          {open && (
            <div id="nav-menu" className="nav-menu">
              {/* On small screens the main links collapse into this menu too */}
              <div className="nav-menu-primary">
                {PRIMARY_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="nav-menu-link" aria-current={isActive(l.href) ? "page" : undefined}>
                    <Icon name={l.icon} />
                    {l.label}
                  </Link>
                ))}
                <hr />
              </div>
              {MENU_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="nav-menu-link" aria-current={isActive(l.href) ? "page" : undefined}>
                  <Icon name={l.icon} />
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
