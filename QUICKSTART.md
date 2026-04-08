# Watch Analyzer — Quickstart

## Setup (5 minutes)

1. Make sure Node.js is installed: `node --version` (need 18+)
2. Open Terminal and run:
```
cd ~/Desktop
npx create-next-app@latest watch-analyzer --typescript --tailwind --app --use-npm
```
3. Hit enter through all the default options
4. Put CLAUDE.md in the watch-analyzer folder root
5. Create the rules folder and put design-rules.md in it:
```
cd watch-analyzer
mkdir -p .claude/rules
```
6. Move design-rules.md into .claude/rules/
7. Launch Claude Code:
```
claude
```

## Build Prompts — Paste In Order

### 1. Setup
```
Read the CLAUDE.md. Set up the project structure — create all folders and empty placeholder files as defined. Install recharts. Don't build anything yet, just the structure.
```

### 2. Landing Page (make it beautiful)
```
Build the landing page. Just the search bar and layout, no functionality. Follow the CLAUDE.md design direction exactly — luxury dark terminal aesthetic. Cormorant Garamond for headers, JetBrains Mono for data, DM Sans for body. Near-black background with subtle noise grain texture. Gold accents. The search bar should be centered, large, minimal, with a subtle gold glow on focus. Add a tagline above it. Use the frontend-design plugin. Screenshot it and iterate until it looks premium and unforgettable. This must NOT look like generic AI output.
```

### 3. Watch Database
```
Build src/lib/watch-database.ts with hardcoded data for at least 30 popular watch references. Include: Rolex Submariner (124060, 126610LN), GMT-Master II (126710BLNR, 126710BLRO), Daytona (126500LN), Explorer (124270), Datejust (126234, 126334), Omega Speedmaster (310.30.42.50.01.001), Seamaster 300M (210.30.42.20.01.001), Tudor Black Bay 58 (79030N), Black Bay Pro (79470), AP Royal Oak (15500ST, 15550ST), Cartier Santos (WSSA0029, WSSA0061), Grand Seiko Snowflake (SBGA211), IWC Portugieser (IW371605), JLC Reverso, Patek Nautilus 5711, Tag Heuer Carrera, Seiko Presage SPB167, Tissot PRX Powermatic 80, Longines Spirit Zulu Time, and more. For each include: brand, model, reference, MSRP, case size, movement, water resistance, year introduced, retail availability, and 10-12 months of price history data points. Research realistic current market prices for each.
```

### 4. Search + Autocomplete
```
Build src/lib/search.ts with fuzzy matching against the watch database. Then update SearchBar.tsx to show autocomplete suggestions as the user types — matching on brand name, model name, and reference number. The dropdown should match our dark luxury design. Typing "sub" should show "Rolex Submariner 124060", "Rolex Submariner Date 126610LN", etc.
```

### 5. Scoring Engine
```
Build src/lib/scorer.ts using the exact algorithm from CLAUDE.md. Takes watch database entry, returns score 0-100, verdict label, and a one-liner explanation. Test it with a few different references and show me the outputs.
```

### 6. Result Components
```
Build all result components using real data from the watch database (use the Rolex Submariner 124060 as the demo). Build: ScoreGauge (animated circular gauge counting up to score), VerdictHero (verdict label + one-liner), MarketPrice (current avg price, MSRP, price range bar), PriceTrend (area chart with Recharts showing price history, 30/90 day changes), QuickStats (liquidity, volatility, retail availability), ReferenceInfo (specs card). Wire into page.tsx below the search bar. Everything should animate in with staggered reveals. Follow the design system strictly.
```

### 7. Wire It Together
```
Connect the full flow: user types watch name → selects from autocomplete → page shows loading skeleton → results appear with animations. Build the API route at src/app/api/analyze/route.ts that takes a reference number, looks up the watch database, runs the scorer, and returns everything the frontend needs. Add smooth transitions between empty state, loading, and results.
```

### 8. Polish + Deploy
```
Final polish. Screenshot every section and iterate until perfect. Check mobile responsiveness. Smooth all animations. Make sure the score gauge animation is buttery. Then initialize git, push to GitHub, and deploy to Vercel. Walk me through the deploy steps if needed. Give me the live URL.
```
