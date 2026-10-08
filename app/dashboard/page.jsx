"use client";

import { useEffect, useState } from "react";
import { getDashboard, getHealth } from "../../lib/apiClient";

function formatDuration(ms) {
  if (ms === null || ms === undefined) return "—";
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remSeconds}s`;
}

export default function DashboardPage() {
  const [health, setHealth] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [h, d] = await Promise.all([
        getHealth().catch(() => ({ status: "error", db: "unreachable" })),
        getDashboard(),
      ]);
      setHealth(h);
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const isHealthy = health?.status === "ok";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h1 style={{ fontSize: "1.8rem" }}>Dashboard</h1>
        <button className="btn secondary" onClick={load} disabled={loading} type="button">
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: 640 }}>
        Operational summary of the Wordle and Word Search builder — system health,
        usage counts, and anything that needs attention.
      </p>

      {error && (
        <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>System health</h2>
        {health ? (
          <span className={`status-pill ${isHealthy ? "ok" : "error"}`} role="status">
            {isHealthy ? "● Healthy — database connected" : "● Unhealthy — database unreachable"}
          </span>
        ) : (
          <span style={{ opacity: 0.6 }}>Checking…</span>
        )}
      </div>

      {data && (
        <>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <span className="stat-value">{data.activitySetsCreated.total}</span>
              <span className="stat-label">Activity sets created</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{data.activitySetsCreated.wordle}</span>
              <span className="stat-label">Wordle sets</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{data.activitySetsCreated.wordsearch}</span>
              <span className="stat-label">Word Search sets</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{data.totalWords}</span>
              <span className="stat-label">Words stored</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{data.totalWordLists}</span>
              <span className="stat-label">Word lists</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{data.generation.success}</span>
              <span className="stat-label">Successful generations</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{data.generation.failure}</span>
              <span className="stat-label">Failed generations</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {data.generation.successRate === null
                  ? "—"
                  : `${Math.round(data.generation.successRate * 100)}%`}
              </span>
              <span className="stat-label">Generation success rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formatDuration(data.averageTimeOnPageMs)}</span>
              <span className="stat-label">Avg. time on page ({data.pageViewCount} views)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {data.mostUsedActivityType
                  ? data.mostUsedActivityType === "WORDLE"
                    ? "Wordle"
                    : "Word Search"
                  : "—"}
              </span>
              <span className="stat-label">Most-used activity type</span>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Alerts</h2>
            {data.alerts.length === 0 ? (
              <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>No issues detected.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.alerts.map((a, i) => (
                  <div key={i} className={`alert-item ${a.level}`} role={a.level === "error" ? "alert" : "status"}>
                    {a.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
