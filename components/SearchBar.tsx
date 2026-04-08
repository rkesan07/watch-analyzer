"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { search, highlight } from "@/lib/search";
import type { SearchResult } from "@/lib/search";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
  examples?: string[];
  loading?: boolean;
}

// ─── Highlight renderer ───────────────────────────────────────────────────────

function Highlighted({ text, query }: { text: string; query: string }) {
  const segments = highlight(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <span key={i} style={{ color: "var(--accent-gold)", fontWeight: 500 }}>
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

// ─── Price formatter ──────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${n.toLocaleString("en-US")}`;
}

// ─── Category badge ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  dive:          "Dive",
  sport:         "Sport",
  dress:         "Dress",
  pilot:         "Pilot",
  field:         "Field",
  gmt:           "GMT",
  chronograph:   "Chrono",
  complications: "Complication",
  casual:        "Casual",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchBar({ onSelect, examples = [], loading = false }: SearchBarProps) {
  const [query, setQuery]           = useState("");
  const [focused, setFocused]       = useState(false);
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef      = useRef<HTMLDivElement>(null);

  // Whether the dropdown should be visible
  const showDropdown = focused && query.trim().length >= 1;
  const hasResults   = results.length > 0;
  const noResults    = focused && query.trim().length >= 2 && !hasResults;

  // ── Update results on every keystroke ──────────────────────────────────────
  useEffect(() => {
    if (query.trim().length >= 1) {
      const found = search(query);
      setResults(found);
      setActiveIndex(-1);
    } else {
      setResults([]);
      setActiveIndex(-1);
    }
  }, [query]);

  // ── Scroll active item into view ───────────────────────────────────────────
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>("[data-result-item]");
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          commitResult(results[activeIndex]);
        } else if (results.length === 1) {
          commitResult(results[0]);
        }
      } else if (e.key === "Escape") {
        setFocused(false);
        setActiveIndex(-1);
      }
    },
    [results, activeIndex] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const commitResult = useCallback(
    (result: SearchResult) => {
      setQuery(`${result.watch.brand} ${result.watch.model}`);
      setFocused(false);
      setResults([]);
      setActiveIndex(-1);
      onSelect(result);
    },
    [onSelect]
  );

  const setExample = (ex: string) => {
    setQuery(ex);
    inputRef.current?.focus();
    setFocused(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>

      {/* ── Input pill ──────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: "0.5rem",
          border: `1px solid ${focused ? "var(--accent-gold)" : "var(--border)"}`,
          background: "var(--bg-card)",
          boxShadow: focused
            ? "0 0 0 1px rgba(201,168,76,0.18), 0 0 48px rgba(201,168,76,0.07)"
            : "none",
          transition: "border-color 0.2s ease, box-shadow 0.3s ease",
          // flatten bottom corners when dropdown is open
          borderBottomLeftRadius:  showDropdown ? "0" : "0.5rem",
          borderBottomRightRadius: showDropdown ? "0" : "0.5rem",
        }}
      >
        {/* Search icon / loading indicator */}
        <div
          style={{
            position: "absolute",
            left: "18px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: loading
              ? "var(--accent-gold)"
              : focused
              ? "var(--accent-gold)"
              : "var(--text-secondary)",
            transition: "color 0.2s",
            display: "flex",
          }}
        >
          {loading ? (
            /* Spinning arc */
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
              <path d="M12 3 A9 9 0 0 1 21 12" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Search by reference, model, or brand…"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          className="font-body"
          style={{
            width: "100%",
            background: "transparent",
            color: "var(--text-primary)",
            paddingLeft: "50px",
            paddingRight: "124px",
            paddingTop: "18px",
            paddingBottom: "18px",
            fontSize: "0.9375rem",
            letterSpacing: "0.01em",
            outline: "none",
          }}
        />

        {/* Analyse button */}
        <button
          onClick={() => {
            if (results.length === 1) commitResult(results[0]);
            else if (activeIndex >= 0 && results[activeIndex]) commitResult(results[activeIndex]);
          }}
          className="font-body"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: query.trim() ? "var(--accent-gold)" : "transparent",
            color: query.trim() ? "#08080a" : "var(--text-secondary)",
            border: `1px solid ${query.trim() ? "var(--accent-gold)" : "var(--border)"}`,
            borderRadius: "0.375rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: query.trim() ? "pointer" : "default",
            fontSize: "0.625rem",
            fontWeight: 600,
            padding: "8px 14px",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          Analyse
        </button>
      </div>

      {/* ── Autocomplete dropdown ─────────────────────────────────────────────── */}
      {showDropdown && (
        <div
          ref={listRef}
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg-card)",
            border: "1px solid var(--accent-gold)",
            borderTop: "1px solid var(--border)",
            borderBottomLeftRadius: "0.5rem",
            borderBottomRightRadius: "0.5rem",
            overflow: "hidden",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.06)",
          }}
        >
          {hasResults ? (
            <>
              {results.map((result, i) => {
                const isActive = i === activeIndex;
                const { watch, currentPrice, key } = result;
                const displayRef = key.length <= 12 ? key : watch.reference.split(".")[0];

                return (
                  <button
                    key={key}
                    data-result-item
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent input blur before click registers
                      commitResult(result);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "11px 16px",
                      background: isActive ? "var(--bg-card-hover)" : "transparent",
                      borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s",
                      borderLeft: isActive ? "2px solid var(--accent-gold)" : "2px solid transparent",
                    }}
                  >
                    {/* Left: brand / model / reference */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="font-body"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.6875rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: "2px",
                        }}
                      >
                        <Highlighted text={watch.brand} query={query} />
                        {watch.nickname && (
                          <span style={{ marginLeft: "6px", color: "var(--accent-gold-dim)" }}>
                            · {watch.nickname}
                          </span>
                        )}
                      </div>

                      <div
                        className="font-body"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          fontWeight: 400,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "340px",
                        }}
                      >
                        <Highlighted text={watch.model} query={query} />
                      </div>

                      <div
                        className="font-mono"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.6875rem",
                          marginTop: "2px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        <Highlighted text={displayRef} query={query} />
                        <span
                          style={{
                            marginLeft: "8px",
                            color: "var(--border)",
                            fontSize: "0.625rem",
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border)",
                            borderRadius: "3px",
                            padding: "1px 5px",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {CATEGORY_LABELS[watch.category] ?? watch.category}
                        </span>
                      </div>
                    </div>

                    {/* Right: current market price */}
                    <div
                      style={{
                        marginLeft: "16px",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        className="font-mono"
                        style={{
                          color: isActive ? "var(--accent-gold)" : "var(--text-primary)",
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          letterSpacing: "0.03em",
                          transition: "color 0.1s",
                        }}
                      >
                        {formatPrice(currentPrice)}
                      </div>
                      <div
                        className="font-body"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.625rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginTop: "2px",
                        }}
                      >
                        market avg
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Keyboard hint */}
              <div
                className="font-body"
                style={{
                  padding: "7px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderTop: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                }}
              >
                {[
                  { keys: "↑↓", label: "navigate" },
                  { keys: "↵",  label: "select" },
                  { keys: "esc", label: "dismiss" },
                ].map(({ keys, label }) => (
                  <span
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "var(--text-secondary)",
                      fontSize: "0.625rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <kbd
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "3px",
                        padding: "1px 5px",
                        fontFamily: "inherit",
                        fontSize: "0.625rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {keys}
                    </kbd>
                    {label}
                  </span>
                ))}
              </div>
            </>
          ) : noResults ? (
            /* ── No results ─────────────────────────────────────────────────── */
            <div
              className="font-body"
              style={{
                padding: "20px 16px",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                textAlign: "center",
              }}
            >
              <span style={{ display: "block", marginBottom: "4px", color: "var(--text-primary)" }}>
                No watches found for &ldquo;{query}&rdquo;
              </span>
              <span style={{ fontSize: "0.75rem" }}>
                Try a brand name, model, or reference number
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Example search chips ──────────────────────────────────────────────── */}
      {examples.length > 0 && (
        <div
          style={{
            marginTop: "14px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px 6px",
            justifyContent: "center",
          }}
        >
          <span
            className="label"
            style={{ color: "var(--text-secondary)", opacity: 0.55, marginRight: "2px" }}
          >
            Try:
          </span>
          {examples.map((ex) => (
            <ExampleChip key={ex} label={ex} onClick={() => setExample(ex)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Example chip sub-component ───────────────────────────────────────────────

function ExampleChip({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="font-body"
      style={{
        fontSize: "0.6875rem",
        color: hovered ? "var(--accent-gold)" : "var(--text-secondary)",
        border: `1px solid ${hovered ? "rgba(201,168,76,0.35)" : "var(--border)"}`,
        borderRadius: "999px",
        padding: "4px 12px",
        background: "transparent",
        cursor: "pointer",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        transition: "color 0.15s, border-color 0.15s",
      }}
    >
      {label}
    </button>
  );
}
