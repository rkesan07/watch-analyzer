# Watch Analyzer

## What This Is
A website where you type in any watch (like "Rolex Submariner 124060" or "Omega Speedmaster") and instantly get a stunning visual breakdown: current market price, price trends, whether it's above or below retail, whether now is a good time to buy, and where to find the best deals. One page, one search bar, beautiful results.

## The Product

### User Flow
1. User lands on a gorgeous dark page with a search bar
2. Types a watch name or reference number (e.g. "Tudor Black Bay 58")
3. Hits enter
4. Gets a rich, animated analysis page with everything they need to know

### What The User Sees After Searching:

**Verdict Hero**
- Large animated deal score gauge (0-100) with color gradient (red → yellow → green)
- Verdict label: "Strong Buy" / "Good Time to Buy" / "Fair Price" / "Wait" / "Overpriced"
- One-liner: "The Black Bay 58 is trading 11% below retail with a downward trend. Good entry point."

**Current Market Card**
- Current average market price (large, prominent)
- Retail MSRP and the difference (above/below retail as %)
- Price range bar showing the spread of current listings (low to high)
- Number of active listings (liquidity indicator)

**Price Trend Card**
- Area chart showing price movement over the last 6-12 months
- 30-day and 90-day percentage change (with up/down arrows and color)
- Simple trend label: "Trending Up" / "Stable" / "Trending Down"

**Quick Stats Row**
- Avg days to sell (liquidity)
- Price volatility (stable vs. volatile)
- Retail availability (easy / waitlist / impossible)

**Reference Info Card**
- Brand, model, reference number
- Case size, movement type, water resistance
- Year introduced
- Retail MSRP

### What V1 Does NOT Include
- No user accounts
- No saved searches
- No portfolio tracking
- No notifications
- No individual listing analysis
- No database

## Tech Stack (All Free)
- **Next.js 14** with App Router — framework
- **Tailwind CSS** — styling
- **Recharts** — charts
- **Vercel** — hosting (free tier)
- **GitHub** — code repository (free)

No database. No auth. No external API keys. No paid services.

## Data Sources

### Market Price Data
Scrape from publicly available sources server-side:
- Chrono24 search results for the reference (average asking price, number of listings, price range)
- WatchCharts public pages (market averages, trends if available)
- If both are blocked by Cloudflare, fall back to the hardcoded reference database

### Reference Database (Hardcoded)
Maintain a comprehensive TypeScript file with data for the top 50+ popular references:
```typescript
export const watchDatabase: Record<string, WatchReference> = {
  "124060": {
    brand: "Rolex",
    model: "Submariner",
    reference: "124060",
    msrp_usd: 9100,
    case_size_mm: 41,
    movement: "Automatic (Cal. 3230)",
    water_resistance: "300m",
    year_introduced: 2020,
    retail_availability: "waitlist",
    category: "dive",
    // Historical price snapshots for trend chart
    price_history: [
      { month: "2025-07", avg_price: 12800 },
      { month: "2025-08", avg_price: 12400 },
      { month: "2025-09", avg_price: 12100 },
      { month: "2025-10", avg_price: 11900 },
      { month: "2025-11", avg_price: 11600 },
      { month: "2025-12", avg_price: 11400 },
      { month: "2026-01", avg_price: 11500 },
      { month: "2026-02", avg_price: 11700 },
      { month: "2026-03", avg_price: 11900 },
      { month: "2026-04", avg_price: 12100 },
    ]
  },
  // ... more references
}
```

This means the app works perfectly even if every scraper gets blocked. The hardcoded data gives us a solid baseline, and live scraping enhances it when available.

### Search / Matching
When a user types "Rolex Sub" or "Submariner" or "124060":
- First try exact reference number match
- Then fuzzy match against brand + model names
- Show suggestions as they type (autocomplete from the reference database)
- If no match found, show "Watch not in our database yet" with a clean message

## Design Direction

### Aesthetic: Luxury Dark Terminal
Swiss watch advertisement meets financial terminal. Dark, data-dense, every element refined and intentional.

### Typography (Google Fonts — all free)
- Display/headers: **Cormorant Garamond** — elegant serif, feels expensive
- Data/numbers: **JetBrains Mono** — monospace, feels precise
- Body text: **DM Sans** — clean, readable

### Color Palette
```css
--bg-primary: #08080a;
--bg-card: #111114;
--bg-card-hover: #19191d;
--border: #1e1e24;
--text-primary: #f0f0f2;
--text-secondary: #6b6b76;
--accent-gold: #c9a84c;
--accent-gold-dim: #8a7434;
--score-green: #10b981;
--score-yellow: #f59e0b;
--score-red: #ef4444;
--chart-line: #c9a84c;
--chart-area: rgba(201,168,76,0.08);
```

### Visual Details
- Subtle noise/grain texture on background (very low opacity)
- Cards: 1px border, no heavy shadows, rounded-lg
- Score gauge: animated conic gradient filling on load
- Chart: area chart with gold line, subtle gradient fill
- Content animates in with staggered fade/slide reveals
- Loading: elegant skeleton shimmer, never spinners
- Score number animates counting up from 0
- Search bar: large, centered, subtle gold glow on focus
- Autocomplete dropdown: dark, minimal, shows matching watches as you type

### Layout
- Centered single column, max-width 720px
- Search bar prominent at top
- Verdict hero immediately below
- Analysis cards stack cleanly
- Generous whitespace between sections
- Fully responsive — great on mobile

## File Structure
```
watch-analyzer/
├── CLAUDE.md
├── .claude/
│   └── rules/
│       └── design-rules.md
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← root layout with fonts
│   │   ├── page.tsx                ← main page
│   │   ├── globals.css             ← global styles + noise texture
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts        ← API: scrape + score + return
│   ├── components/
│   │   ├── SearchBar.tsx           ← search input with autocomplete
│   │   ├── ScoreGauge.tsx          ← animated circular score
│   │   ├── VerdictHero.tsx         ← verdict + one-liner
│   │   ├── MarketPrice.tsx         ← current price + MSRP comparison
│   │   ├── PriceTrend.tsx          ← area chart + trend stats
│   │   ├── QuickStats.tsx          ← liquidity, volatility, availability
│   │   ├── ReferenceInfo.tsx       ← watch specs card
│   │   └── LoadingSkeleton.tsx     ← shimmer loading state
│   ├── lib/
│   │   ├── watch-database.ts       ← hardcoded reference data
│   │   ├── scraper.ts              ← fetch live market data (optional enhancement)
│   │   ├── scorer.ts               ← scoring algorithm
│   │   └── search.ts               ← fuzzy search / autocomplete logic
│   └── types/
│       └── index.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Scoring Algorithm (0-100)

### Market Position (40 points)
Based on current market price vs retail MSRP:
- 15%+ below MSRP → 40 points
- 10-15% below → 35 points
- 5-10% below → 28 points
- At MSRP → 20 points
- 5-10% above → 12 points
- 10-20% above → 6 points
- 20%+ above → 0 points

### Price Trend (35 points)
Based on recent price movement:
- Prices dropping significantly (buyer's market) → 35 points
- Prices dropping slightly → 28 points
- Prices stable → 18 points
- Prices rising slightly (might miss the window) → 10 points
- Prices rising fast (probably too late) → 4 points

### Market Liquidity (25 points)
Based on number of listings and how fast they sell:
- High liquidity (easy to buy AND resell) → 25 points
- Medium liquidity → 18 points
- Low liquidity (hard to find or hard to sell) → 8 points
- Very low (risky) → 3 points

### Verdict Labels
- 80-100: "Strong Buy" (green)
- 65-79: "Good Time to Buy" (light green)
- 50-64: "Fair Price" (yellow/gold)
- 35-49: "Wait" (orange)
- 0-34: "Overpriced" (red)

## Build Order
1. Scaffold Next.js project, set up file structure, install Recharts
2. Build the landing page — search bar + dark luxury design. No functionality. Get the UI stunning first.
3. Build the watch database (hardcoded data for 30+ references with price history)
4. Build search/autocomplete — type and see matching watches
5. Build the scoring engine
6. Build all result components with mock data (score gauge, verdict, price chart, stats)
7. Build the API route — connect search → database → scorer → results
8. Wire the full flow with loading states and animations
9. Try adding live scraping as an enhancement (optional — app works without it)
10. Deploy to Vercel

## Important Notes
- **UI first, data second.** The whole point is that this looks incredible. Build the design with mock data, make it perfect, THEN worry about real data.
- **The hardcoded database IS the V1 product.** Live scraping is a nice-to-have enhancement, not a requirement. 30+ well-researched references with accurate price history is genuinely useful.
- **This is a portfolio piece.** It should look so good that anyone who sees it is immediately impressed.
- **Use the frontend-design plugin.** No generic AI aesthetics. Screenshot loop until it looks like a luxury product.
- **Keep it simple.** One page. One search bar. Beautiful output. Resist the urge to add features.
