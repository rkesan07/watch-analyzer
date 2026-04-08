import { getCurrentPrice, getPriceSpread } from "@/lib/watch-database";
import type { WatchReference, AnalysisResult } from "@/types";

// ─── Market Position Score (0–40 pts) ─────────────────────────────────────────
// Measures how far the current market price sits relative to retail MSRP.
// Buying below retail is inherently safer; heavy premiums signal speculation.

function marketPositionPoints(marketPrice: number, msrp: number): number {
  const pctVsRetail = (marketPrice - msrp) / msrp; // negative = below retail

  if (pctVsRetail <= -0.15) return 40; // 15%+ below MSRP
  if (pctVsRetail <= -0.10) return 35; // 10–15% below
  if (pctVsRetail <= -0.05) return 28; // 5–10% below
  if (pctVsRetail <= 0.05)  return 20; // within ±5% of MSRP ("at retail")
  if (pctVsRetail <= 0.10)  return 12; // 5–10% above
  if (pctVsRetail <= 0.20)  return  6; // 10–20% above
  return 0;                             // 20%+ above MSRP
}

// ─── Price Trend Score (0–35 pts) ─────────────────────────────────────────────
// Uses 90-day price movement from the history array.
// A falling market means more room to buy low; a surging market means risk.

function trendPoints(history: WatchReference["price_history"]): {
  points: number;
  change30d: number;
  change90d: number;
  label: AnalysisResult["trend_label"];
} {
  const len = history.length;
  const current = history[len - 1].avg_price;

  // 30-day change: compare last vs second-to-last month
  const price30dAgo = history[Math.max(0, len - 2)].avg_price;
  const change30d = ((current - price30dAgo) / price30dAgo) * 100;

  // 90-day change: compare last vs ~3 months back
  const price90dAgo = history[Math.max(0, len - 4)].avg_price;
  const change90d = ((current - price90dAgo) / price90dAgo) * 100;

  // Score on 90-day movement (more signal, less noise than 30-day)
  let points: number;
  let label: AnalysisResult["trend_label"];

  if (change90d <= -5) {
    points = 35; // dropping significantly — buyer's market
    label = "Trending Down";
  } else if (change90d <= -2) {
    points = 28; // dropping slightly
    label = "Trending Down";
  } else if (change90d < 2) {
    points = 18; // stable (within ±2%)
    label = "Stable";
  } else if (change90d < 5) {
    points = 10; // rising slightly — might miss the window
    label = "Trending Up";
  } else {
    points = 4;  // rising fast — probably too late
    label = "Trending Up";
  }

  return { points, change30d, change90d, label };
}

// ─── Liquidity Score (0–25 pts) ───────────────────────────────────────────────
// High liquidity = easy to find AND easy to resell. Both matter for a buyer.
// We combine active listing count with avg days-to-sell.

function liquidityPoints(
  activeListings: number,
  avgDaysToSell: number
): number {
  // High: plenty of stock, moves quickly
  if (activeListings >= 350 && avgDaysToSell <= 20) return 25;
  if (activeListings >= 200 && avgDaysToSell <= 22) return 25;

  // Medium: reasonable availability or moderate sell time
  if (activeListings >= 200 && avgDaysToSell <= 30) return 18;
  if (activeListings >= 100 && avgDaysToSell <= 25) return 18;

  // Low: hard to find or takes a while to move
  if (activeListings >= 100 && avgDaysToSell <= 40) return 8;
  if (activeListings >= 50)                          return 8;

  // Very low: scarce or extremely illiquid
  return 3;
}

// ─── Verdict label ─────────────────────────────────────────────────────────────

function verdictLabel(score: number): AnalysisResult["verdict"] {
  if (score >= 80) return "Strong Buy";
  if (score >= 65) return "Good Time to Buy";
  if (score >= 50) return "Fair Price";
  if (score >= 35) return "Wait";
  return "Overpriced";
}

// ─── One-liner generator ───────────────────────────────────────────────────────
// Produces a single human-readable sentence summarising the key signals.

function buildOneLiner(
  watch: WatchReference,
  marketPrice: number,
  pctVsRetail: number,
  trendLabel: AnalysisResult["trend_label"],
  change90d: number,
  verdict: AnalysisResult["verdict"]
): string {
  const name =
    watch.nickname
      ? `The ${watch.nickname}`
      : `The ${watch.brand} ${watch.model}`;

  // Retail position clause
  const absPct = Math.abs(pctVsRetail * 100).toFixed(0);
  const positionClause =
    pctVsRetail <= -0.01
      ? `is trading ${absPct}% below retail`
      : pctVsRetail >= 0.01
      ? `is trading ${absPct}% above retail`
      : `is trading at roughly retail price`;

  // Trend clause
  const absChange = Math.abs(change90d).toFixed(1);
  const trendClause =
    trendLabel === "Trending Down"
      ? change90d <= -5
        ? ` with prices falling sharply (${absChange}% in 90 days)`
        : ` with a softening market (${absChange}% in 90 days)`
      : trendLabel === "Trending Up"
      ? change90d >= 5
        ? ` and prices rising fast (${absChange}% in 90 days)`
        : ` with prices creeping up (${absChange}% in 90 days)`
      : ` with a stable price trend`;

  // Availability note for discontinued / impossible refs
  const availNote =
    watch.retail_availability === "discontinued"
      ? " (discontinued reference — no retail option)."
      : watch.retail_availability === "impossible"
      ? ". Retail allocation nearly impossible."
      : ".";

  // Verdict call-to-action
  const cta: Record<AnalysisResult["verdict"], string> = {
    "Strong Buy":       " Strong entry point.",
    "Good Time to Buy": " Good entry point.",
    "Fair Price":       " Fair market price.",
    "Wait":             " Consider waiting for a better entry.",
    "Overpriced":       " Overpriced on the secondary market.",
  };

  return `${name} ${positionClause}${trendClause}${availNote}${cta[verdict]}`;
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function scoreWatch(watch: WatchReference): AnalysisResult {
  const currentPrice = getCurrentPrice(watch);
  const { low: priceLow, high: priceHigh } = getPriceSpread(watch);

  const pctVsRetail = (currentPrice - watch.msrp_usd) / watch.msrp_usd;

  const marketPos  = marketPositionPoints(currentPrice, watch.msrp_usd);
  const trend      = trendPoints(watch.price_history);
  const liquidity  = liquidityPoints(watch.active_listings, watch.avg_days_to_sell);

  const totalScore = marketPos + trend.points + liquidity;
  const verdict    = verdictLabel(totalScore);
  const oneLiner   = buildOneLiner(
    watch,
    currentPrice,
    pctVsRetail,
    trend.label,
    trend.change90d,
    verdict
  );

  return {
    watch,
    current_market_price: currentPrice,
    price_low:  priceLow,
    price_high: priceHigh,
    score:      totalScore,
    verdict,
    one_liner:  oneLiner,
    trend_label:           trend.label,
    change_30d:            Math.round(trend.change30d * 10) / 10,
    change_90d:            Math.round(trend.change90d * 10) / 10,
    market_position_points: marketPos,
    trend_points:           trend.points,
    liquidity_points:       liquidity,
  };
}
