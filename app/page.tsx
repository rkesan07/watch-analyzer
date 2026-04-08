"use client";

import { useState, useCallback } from "react";
import { SearchBar }       from "@/components/SearchBar";
import { VerdictHero }     from "@/components/VerdictHero";
import { MarketPrice }     from "@/components/MarketPrice";
import { PriceTrend }      from "@/components/PriceTrend";
import { QuickStats }      from "@/components/QuickStats";
import { ReferenceInfo }   from "@/components/ReferenceInfo";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { watchDatabase }   from "@/lib/watch-database";
import { scoreWatch }      from "@/lib/scorer";
import type { SearchResult } from "@/lib/search";
import type { AnalysisResult } from "@/types";

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_RESULT = scoreWatch(watchDatabase["124060"]);

// ── Page state machine ────────────────────────────────────────────────────────
type PageState = "demo" | "loading" | "results" | "error";

// ── Staggered result cards ────────────────────────────────────────────────────
// `animKey` is applied at the call site as the React `key`, forcing a remount
// (and thus replaying all FadeIn animations) on every new search.
function ResultCards({ result }: { result: AnalysisResult }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="fade-in" style={{ animationDelay: "0ms" }}>
        <VerdictHero result={result} />
      </div>
      <div className="fade-in" style={{ animationDelay: "100ms" }}>
        <MarketPrice result={result} />
      </div>
      <div className="fade-in" style={{ animationDelay: "200ms" }}>
        <PriceTrend result={result} />
      </div>
      <div className="fade-in" style={{ animationDelay: "300ms" }}>
        <QuickStats result={result} />
      </div>
      <div className="fade-in" style={{ animationDelay: "400ms" }}>
        <ReferenceInfo result={result} />
      </div>
    </div>
  );
}

// ── Error card ────────────────────────────────────────────────────────────────
function ErrorCard() {
  return (
    <div
      className="fade-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "3rem 2rem",
        textAlign: "center",
      }}
    >
      <p
        className="font-display"
        style={{
          color: "var(--text-primary)",
          fontSize: "1.25rem",
          fontWeight: 300,
          marginBottom: "0.5rem",
        }}
      >
        Watch not found
      </p>
      <p className="label">
        Try searching by brand, model, or reference number
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [pageState, setPageState] = useState<PageState>("demo");
  const [result, setResult]       = useState<AnalysisResult>(DEMO_RESULT);
  const [animKey, setAnimKey]     = useState(0);
  const [label, setLabel]         = useState("Demo · Rolex Submariner 124060");
  // Once the user has searched, the hero compresses
  const [hasSearched, setHasSearched] = useState(false);

  const handleSelect = useCallback(async (sr: SearchResult) => {
    const watchLabel =
      `${sr.watch.brand} ${sr.watch.model}` +
      (sr.watch.nickname ? ` · ${sr.watch.nickname}` : "");

    setLabel(watchLabel);
    setHasSearched(true);
    setPageState("loading");

    try {
      const res = await fetch(`/api/analyze?q=${encodeURIComponent(sr.key)}`);
      if (!res.ok) throw new Error("not found");
      const data: AnalysisResult = await res.json();
      setResult(data);
      setAnimKey((k) => k + 1);
      setPageState("results");
    } catch {
      setPageState("error");
    }
  }, []);

  return (
    <main
      className="flex flex-col items-center px-6 pb-24"
      style={{
        paddingTop: hasSearched ? "32px" : "56px",
        transition: "padding-top 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* ── Wordmark ──────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[720px] flex justify-center mb-8">
        <span
          className="font-display tracking-[0.25em] uppercase"
          style={{ color: "var(--accent-gold)", fontWeight: 500, fontSize: "0.8125rem" }}
        >
          Watch Analyzer
        </span>
      </div>

      {/* ── Hero headline — visible only before first search ──────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          textAlign: "center",
          overflow: "hidden",
          maxHeight: hasSearched ? "0" : "160px",
          opacity: hasSearched ? 0 : 1,
          marginBottom: hasSearched ? "0" : "2rem",
          transition:
            "max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1), " +
            "opacity 0.3s ease, " +
            "margin-bottom 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: "none",
        }}
      >
        <p className="label mb-4" style={{ color: "var(--accent-gold-dim)" }}>
          Market Intelligence
        </p>
        <h1
          className="font-display leading-[1.08] tracking-tight mb-4"
          style={{
            color: "var(--text-primary)",
            fontSize: "clamp(1.5rem, 4.5vw, 3.25rem)",
            fontWeight: 300,
          }}
        >
          Is now the right time{" "}
          <em style={{ color: "var(--accent-gold)", fontStyle: "italic" }}>
            to buy?
          </em>
        </h1>
      </div>

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <div
        className="w-full max-w-[720px]"
        style={{
          marginBottom: hasSearched ? "1.5rem" : "3rem",
          transition: "margin-bottom 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <SearchBar
          onSelect={handleSelect}
          loading={pageState === "loading"}
          examples={
            hasSearched
              ? []
              : [
                  "Rolex Submariner 124060",
                  "Omega Speedmaster",
                  "Tudor Black Bay 58",
                  "Patek Nautilus",
                  "AP Royal Oak",
                ]
          }
        />
      </div>

      {/* ── Divider + context label ────────────────────────────────────────── */}
      <div
        className="w-full max-w-[720px] flex items-center gap-4 mb-8"
        style={{ opacity: 0.5 }}
      >
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        <span
          className="font-body"
          style={{
            color:
              pageState === "loading"
                ? "var(--accent-gold-dim)"
                : "var(--text-secondary)",
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            animation:
              pageState === "loading" ? "pulse 1.5s ease-in-out infinite" : "none",
            transition: "color 0.3s ease",
          }}
        >
          {pageState === "loading" ? "Analyzing…" : label}
        </span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[720px]">
        {pageState === "loading" && <LoadingSkeleton />}

        {pageState === "error" && <ErrorCard />}

        {/* `key={animKey}` forces a full remount on each new search,
            which replays all the staggered fade-in animations */}
        {pageState === "results" && (
          <ResultCards key={animKey} result={result} />
        )}

        {pageState === "demo" && (
          <ResultCards key="demo" result={DEMO_RESULT} />
        )}
      </div>
    </main>
  );
}
