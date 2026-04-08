"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalysisResult } from "@/types";
interface PriceTrendProps {
  result: AnalysisResult;
}

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function fmtMonth(ym: string): string {
  const [, m] = ym.split("-");
  return MONTH_NAMES[+m - 1];
}

function fmtPrice(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="font-body"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.375rem",
        padding: "8px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p className="label" style={{ marginBottom: "4px" }}>{label}</p>
      <p
        className="font-mono"
        style={{ color: "var(--accent-gold)", fontSize: "0.9375rem" }}
      >
        {fmtPrice(payload[0].value ?? 0)}
      </p>
    </div>
  );
}

// ─── Change stat pill ─────────────────────────────────────────────────────────
function ChangePill({ label, value }: { label: string; value: number }) {
  const up    = value > 0;
  const stable = Math.abs(value) < 0.5;
  const color  = stable
    ? "var(--text-secondary)"
    : up ? "var(--score-red)"
    : "var(--score-green)";

  const arrow = stable ? "—" : up ? "↑" : "↓";

  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border)",
        borderRadius: "0.375rem",
        padding: "10px 16px",
        minWidth: "110px",
      }}
    >
      <p className="label" style={{ marginBottom: "5px" }}>{label}</p>
      <p
        className="font-mono"
        style={{
          color,
          fontSize: "1.125rem",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        {arrow} {Math.abs(value).toFixed(1)}%
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PriceTrend({ result }: PriceTrendProps) {
  const { watch, change_30d, change_90d, trend_label } = result;
  const history = watch.price_history;

  const chartData = history.map((pt) => ({
    month: fmtMonth(pt.month),
    price: pt.avg_price,
  }));

  // Y-axis domain with a bit of breathing room
  const prices    = history.map((p) => p.avg_price);
  const minPrice  = Math.min(...prices);
  const maxPrice  = Math.max(...prices);
  const padding   = (maxPrice - minPrice) * 0.15;
  const yMin      = Math.floor((minPrice - padding) / 100) * 100;
  const yMax      = Math.ceil((maxPrice  + padding) / 100) * 100;

  const trendColor =
    trend_label === "Trending Down" ? "var(--score-green)"
    : trend_label === "Trending Up"  ? "var(--score-red)"
    : "var(--score-yellow)";

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1.5rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <p className="label">Price History</p>
        <span
          className="font-body"
          style={{
            color: trendColor,
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span style={{ fontSize: "0.8rem" }}>
            {trend_label === "Trending Down" ? "↘" : trend_label === "Trending Up" ? "↗" : "→"}
          </span>
          {trend_label}
        </span>
      </div>

      {/* Chart */}
      <div className="price-chart-area" style={{ height: "160px", marginBottom: "1.25rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#c9a84c" stopOpacity={0.20} />
                <stop offset="100%" stopColor="#c9a84c" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#1e1e24"
              strokeDasharray="3 0"
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#6b6b76", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: "#6b6b76", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={40}
              dx={-2}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#1e1e24", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#c9a84c"
              strokeWidth={1.75}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#c9a84c",
                stroke: "var(--bg-card)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 30d / 90d change pills */}
      <div style={{ display: "flex", gap: "10px" }}>
        <ChangePill label="30-Day Change"  value={change_30d} />
        <ChangePill label="90-Day Change"  value={change_90d} />
      </div>
    </div>
  );
}
