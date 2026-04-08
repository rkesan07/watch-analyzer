"use client";

import type { AnalysisResult } from "@/types";

interface MarketPriceProps {
  result: AnalysisResult;
}

function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

function fmtK(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);
}

export function MarketPrice({ result }: MarketPriceProps) {
  const { current_market_price, price_low, price_high, watch } = result;
  const { msrp_usd, active_listings } = watch;

  const pctVsRetail = ((current_market_price - msrp_usd) / msrp_usd) * 100;
  const isAbove     = pctVsRetail > 0;
  const diffColor   = isAbove ? "var(--score-red)" : "var(--score-green)";
  const diffSign    = isAbove ? "+" : "";

  // Position of current price along the range bar [0–100%]
  const range      = price_high - price_low;
  const markerPct  = range > 0
    ? Math.max(2, Math.min(98, ((current_market_price - price_low) / range) * 100))
    : 50;

  // Position of MSRP if it falls within the range
  const msrpPct = range > 0
    ? ((msrp_usd - price_low) / range) * 100
    : null;
  const msrpInRange = msrpPct !== null && msrpPct >= 0 && msrpPct <= 100;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1.5rem",
      }}
    >
      {/* Header row */}
      <div
        className="market-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Current market price */}
        <div>
          <p
            className="label"
            style={{ marginBottom: "6px" }}
          >
            Current Market Price
          </p>
          <p
            className="font-mono"
            style={{
              color: "var(--text-primary)",
              fontSize: "2rem",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {fmt(current_market_price)}
          </p>
          <p
            className="font-body"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              marginTop: "5px",
            }}
          >
            Average asking price across listings
          </p>
        </div>

        {/* MSRP vs Market */}
        <div className="msrp-col" style={{ textAlign: "right" }}>
          <p className="label" style={{ marginBottom: "6px" }}>vs Retail MSRP</p>
          <p
            className="font-mono"
            style={{
              color: diffColor,
              fontSize: "1.5rem",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            {diffSign}{pctVsRetail.toFixed(1)}%
          </p>
          <p
            className="font-body"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              marginTop: "5px",
            }}
          >
            MSRP {fmt(msrp_usd)}
          </p>
        </div>
      </div>

      {/* Price range bar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span className="label">Market Range</span>
          <span
            className="font-body"
            style={{ color: "var(--text-secondary)", fontSize: "0.6875rem" }}
          >
            {active_listings} active listings
          </span>
        </div>

        {/* Bar */}
        <div
          style={{
            position: "relative",
            height: "6px",
            background: "var(--border)",
            borderRadius: "3px",
          }}
        >
          {/* Filled portion of the range */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(201,168,76,0.15), rgba(201,168,76,0.35))",
              borderRadius: "3px",
            }}
          />

          {/* MSRP tick (if in range) */}
          {msrpInRange && (
            <div
              style={{
                position: "absolute",
                top: "-3px",
                left: `${msrpPct}%`,
                width: "2px",
                height: "12px",
                background: "var(--accent-gold-dim)",
                borderRadius: "1px",
                transform: "translateX(-50%)",
              }}
              title={`MSRP ${fmt(msrp_usd)}`}
            />
          )}

          {/* Current price marker */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${markerPct}%`,
              width: "12px",
              height: "12px",
              background: "var(--text-primary)",
              border: "2px solid var(--bg-primary)",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 1px var(--accent-gold)",
            }}
          />
        </div>

        {/* Range labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
          }}
        >
          <span
            className="font-mono"
            style={{ color: "var(--text-secondary)", fontSize: "0.6875rem" }}
          >
            {fmtK(price_low)}
          </span>
          {msrpInRange && (
            <span
              className="font-body"
              style={{
                color: "var(--accent-gold-dim)",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                alignSelf: "center",
              }}
            >
              MSRP
            </span>
          )}
          <span
            className="font-mono"
            style={{ color: "var(--text-secondary)", fontSize: "0.6875rem" }}
          >
            {fmtK(price_high)}
          </span>
        </div>
      </div>

      {/* Availability note */}
      {!msrpInRange && (
        <p
          className="font-body"
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.75rem",
            fontStyle: "italic",
          }}
        >
          MSRP {fmt(msrp_usd)} sits outside the current secondary market range.
        </p>
      )}
    </div>
  );
}
