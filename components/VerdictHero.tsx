"use client";

import { useEffect, useState } from "react";
import { ScoreGauge } from "@/components/ScoreGauge";
import type { AnalysisResult } from "@/types";

interface VerdictHeroProps {
  result: AnalysisResult;
}

const VERDICT_COLOR: Record<AnalysisResult["verdict"], string> = {
  "Strong Buy":       "var(--score-green)",
  "Good Time to Buy": "var(--score-green)",
  "Fair Price":       "var(--accent-gold)",
  "Wait":             "var(--score-yellow)",
  "Overpriced":       "var(--score-red)",
};

const VERDICT_BG: Record<AnalysisResult["verdict"], string> = {
  "Strong Buy":       "rgba(16,185,129,0.10)",
  "Good Time to Buy": "rgba(16,185,129,0.10)",
  "Fair Price":       "rgba(201,168,76,0.10)",
  "Wait":             "rgba(245,158,11,0.10)",
  "Overpriced":       "rgba(239,68,68,0.10)",
};

// ─── Animated sub-score bar ───────────────────────────────────────────────────
function SubScore({ label, value, max }: { label: string; value: number; max: number }) {
  const targetPct = (value / max) * 100;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Small delay so the CSS transition has a start state to animate from
    const t = setTimeout(() => setWidth(targetPct), 80);
    return () => clearTimeout(t);
  }, [targetPct]);

  const color =
    targetPct >= 65 ? "var(--score-green)"
    : targetPct >= 40 ? "var(--score-yellow)"
    : "var(--score-red)";

  return (
    <div style={{ flex: 1 }}>
      <div
        className="font-body"
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          height: "4px",
          background: "var(--border)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: color,
            borderRadius: "2px",
            transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
        }}
      >
        <span
          className="font-mono"
          style={{ color: "var(--text-secondary)", fontSize: "0.5875rem", letterSpacing: "0.04em" }}
        >
          {value}<span style={{ opacity: 0.45 }}>/{max}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function VerdictHero({ result }: VerdictHeroProps) {
  const { score, verdict, one_liner, market_position_points, trend_points, liquidity_points } = result;
  const color = VERDICT_COLOR[verdict];
  const bg    = VERDICT_BG[verdict];

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1.75rem",
      }}
    >
      <div
        className="verdict-flex"
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {/* ── Gauge ─────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <ScoreGauge score={score} size={160} />
        </div>

        {/* ── Right panel ───────────────────────────────────────────── */}
        <div className="verdict-text" style={{ flex: 1, minWidth: "200px" }}>

          {/* Verdict badge */}
          <div style={{ marginBottom: "12px" }}>
            <span
              className="font-body"
              style={{
                display: "inline-block",
                background: bg,
                color,
                border: `1px solid ${color}`,
                borderRadius: "0.25rem",
                padding: "4px 12px",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.92,
              }}
            >
              {verdict}
            </span>
          </div>

          {/* One-liner */}
          <p
            className="font-body"
            style={{
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              marginBottom: "20px",
              opacity: 0.85,
            }}
          >
            {one_liner}
          </p>

          {/* Sub-score breakdown bars */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              paddingTop: "4px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ flex: 1, paddingTop: "12px" }}>
              <SubScore label="Market Position" value={market_position_points} max={40} />
            </div>
            <div style={{ flex: 1, paddingTop: "12px" }}>
              <SubScore label="Price Trend" value={trend_points} max={35} />
            </div>
            <div style={{ flex: 1, paddingTop: "12px" }}>
              <SubScore label="Liquidity" value={liquidity_points} max={25} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
