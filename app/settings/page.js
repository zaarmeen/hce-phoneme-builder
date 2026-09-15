"use client";

import { useEffect, useState } from "react";
import { getTheme, setTheme, getLayout, setLayout } from "../../lib/themeCookie";

export default function SettingsPage() {
  const [theme, setThemeState] = useState("light");
  const [layout, setLayoutState] = useState("comfortable");

  useEffect(() => {
    setThemeState(getTheme());
    setLayoutState(getLayout());
  }, []);

  function applyTheme(next) {
    setThemeState(next);
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }

  function applyLayout(next) {
    setLayoutState(next);
    setLayout(next);
    document.documentElement.dataset.layout = next;
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: 16 }}>Settings</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Theme</h2>
        <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: 14 }}>
          Saved in a cookie, so it persists next time you open the builder on this device.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={theme === "light" ? "btn" : "btn secondary"}
            onClick={() => applyTheme("light")}
          >
            Light mode
          </button>
          <button
            className={theme === "dark" ? "btn" : "btn secondary"}
            onClick={() => applyTheme("dark")}
          >
            Dark mode
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Layout density</h2>
        <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: 14 }}>
          Optional preference for how spacious the builder screens feel.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={layout === "comfortable" ? "btn" : "btn secondary"}
            onClick={() => applyLayout("comfortable")}
          >
            Comfortable
          </button>
          <button
            className={layout === "compact" ? "btn" : "btn secondary"}
            onClick={() => applyLayout("compact")}
          >
            Compact
          </button>
        </div>
      </div>
    </div>
  );
}
