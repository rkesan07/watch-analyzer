export interface PricePoint {
  month: string; // "YYYY-MM"
  avg_price: number;
}

export type RetailAvailability = "easy" | "waitlist" | "impossible" | "discontinued";

export type WatchCategory =
  | "dive"
  | "sport"
  | "dress"
  | "pilot"
  | "field"
  | "gmt"
  | "chronograph"
  | "complications"
  | "casual";

export interface WatchReference {
  brand: string;
  model: string;
  nickname?: string; // e.g. "Batman", "Pepsi", "Snowflake"
  reference: string;
  msrp_usd: number;
  case_size_mm: number;
  case_material: string;
  movement: string;
  water_resistance: string;
  year_introduced: number;
  retail_availability: RetailAvailability;
  category: WatchCategory;
  // Current market snapshot (updated with price_history)
  active_listings: number; // approximate active listings on grey market
  avg_days_to_sell: number;
  // Aliases used for fuzzy search
  aliases: string[];
  price_history: PricePoint[];
}

export interface AnalysisResult {
  watch: WatchReference;
  current_market_price: number;
  price_low: number;
  price_high: number;
  score: number;
  verdict: "Strong Buy" | "Good Time to Buy" | "Fair Price" | "Wait" | "Overpriced";
  one_liner: string;
  trend_label: "Trending Up" | "Stable" | "Trending Down";
  change_30d: number; // percentage
  change_90d: number; // percentage
  market_position_points: number;
  trend_points: number;
  liquidity_points: number;
}
