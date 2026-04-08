"use client";

import type { AnalysisResult } from "@/types";
import type { PricePoint, RetailAvailability } from "@/types";

interface QuickStatsProps {
  result: AnalysisResult;
}

// ─── Volatility ────────────────────────────────────────────────────────────────
function computeVolatility(history: PricePoint[]): {
  label: string;
  color: string;
} {
  if (history.length < 3) return { label: "N/A", color: "var(--text-secondary)" };

  const changes: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const pct = Math.abs(
      (history[i].avg_price - history[i - 1].avg_price) / history[i - 1].avg_price
    ) * 100;
    changes.push(pct);
  }
  const avg = changes.reduce((a, b) => a + b, 0) / changes.length;

  if (avg < 0.8) return { label: "Very Stable", color: "var(--score-green)" };
  if (avg < 1.8) return { label: "Stable",      color: "var(--score-green)" };
  if (avg < 3.5) return { label: "Moderate",    color: "var(--score-yellow)" };
  return            { label: "Volatile",         color: "var(--score-red)" };
}

// ─── Availability label ────────────────────────────────────────────────────────
const AVAIL: Record<RetailAvailability, { label: string; color: string }> = {
  easy:          { label: "At Retail",          color: "var(--score-green)"  },
  waitlist:      { label: "Waitlist",            color: "var(--score-yellow)" },
  impossible:    { label: "Allocation Only",     color: "var(--score-red)"    },
  discontinued:  { label: "Discontinued",        color: "var(--score-red)"    },
};

// ─── Single stat cell ──────────────────────────────────────────────────────────
function StatCell({
  label,
  value,
  sub,
  valueColor = "var(--text-primary)",
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "1.125rem 1.25rem",
        borderRight: "1px solid var(--border)",
        minWidth: 0,
      }}
    >
      <p className="label" style={{ marginBottom: "8px" }}>
        {label}
      </p>
      <p
        className="font-mono"
        style={{
          color: valueColor,
          fontSize: "1.25rem",
          fontWeight: 500,
          letterSpacing: "0.02em",
          lineHeight: 1,
          marginBottom: sub ? "5px" : 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="font-body"
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.6875rem",
            marginTop: "4px",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function QuickStats({ result }: QuickStatsProps) {
  const { watch } = result;
  const { avg_days_to_sell, active_listings, retail_availability, price_history } = watch;

  const daysColor =
    avg_days_to_sell <= 15 ? "var(--score-green)"
    : avg_days_to_sell <= 25 ? "var(--score-yellow)"
    : "var(--score-red)";

  const volatility = computeVolatility(price_history);
  const avail      = AVAIL[retail_availability];

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      <div className="stats-row" style={{ display: "flex" }}>
        <StatCell
          label="Avg Days to Sell"
          value={`${avg_days_to_sell}d`}
          sub={`${active_listings.toLocaleString()} active listings`}
          valueColor={daysColor}
        />
        <StatCell
          label="Price Volatility"
          value={volatility.label}
          sub="Month-over-month"
          valueColor={volatility.color}
        />
        {/* Last cell: no right border */}
        <div
          style={{
            flex: 1,
            padding: "1.125rem 1.25rem",
            minWidth: 0,
          }}
        >
          <p className="label" style={{ marginBottom: "8px" }}>
            Retail Access
          </p>
          <p
            className="font-mono"
            style={{
              color: avail.color,
              fontSize: "1.125rem",
              fontWeight: 500,
              letterSpacing: "0.01em",
              lineHeight: 1,
              marginBottom: "5px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {avail.label}
          </p>
          <p
            className="font-body"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.6875rem",
              marginTop: "4px",
            }}
          >
            {retail_availability === "easy"
              ? "Can buy at retail"
              : retail_availability === "waitlist"
              ? "Queue at AD required"
              : retail_availability === "impossible"
              ? "Grey market only"
              : "No longer produced"}
          </p>
        </div>
      </div>
    </div>
  );
}
