import { watchDatabase, getCurrentPrice } from "@/lib/watch-database";
import type { WatchReference } from "@/types";

export interface SearchResult {
  key: string;          // the watchDatabase key (reference string used as map key)
  watch: WatchReference;
  currentPrice: number;
  score: number;
}

// ─── Normalisation ─────────────────────────────────────────────────────────────

/** Lower-case, collapse whitespace / dashes / dots / slashes into a single space. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\-\/\.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a normalised string into non-trivial tokens (length ≥ 2). */
function tokens(s: string): string[] {
  return norm(s).split(" ").filter((t) => t.length >= 2);
}

// ─── Scoring ───────────────────────────────────────────────────────────────────

function scoreWatch(
  key: string,
  watch: WatchReference,
  queryNorm: string,
  queryTokens: string[]
): number {
  // Build a normalised corpus: reference key, reference field, brand, model, nickname, aliases
  const refKey  = norm(key);
  const refField = norm(watch.reference);
  const brand   = norm(watch.brand);
  const model   = norm(watch.model);
  const nick    = norm(watch.nickname ?? "");
  const aliasNorms = watch.aliases.map(norm);

  // ── Tier 1: Exact or near-exact matches ──────────────────────────────────
  if (refKey === queryNorm || refField === queryNorm) return 300;
  if (aliasNorms.some((a) => a === queryNorm)) return 280;
  if (brand === queryNorm) return 250;

  let score = 0;

  // ── Tier 2: Starts-with on reference / key ────────────────────────────────
  if (refKey.startsWith(queryNorm))   score += 120;
  if (refField.startsWith(queryNorm)) score += 110;

  // ── Tier 3: Per-token matching ────────────────────────────────────────────
  let tokensHit = 0;

  for (const tok of queryTokens) {
    let hit = false;

    // Exact substring in the reference strings (handles "blnr" inside "126710blnr")
    if (refKey.includes(tok) || refField.includes(tok)) {
      score += 30;
      hit = true;
    }

    // Word-prefix match in brand ("rol" → "rolex")
    if (brand.split(" ").some((w) => w.startsWith(tok))) {
      score += 25;
      hit = true;
    }

    // Word-prefix match in model ("sub" → "submariner", "speed" → "speedmaster")
    if (model.split(" ").some((w) => w.startsWith(tok))) {
      score += 25;
      hit = true;
    }

    // Word-prefix match in nickname ("batman", "pepsi", "snowflake")
    if (nick && nick.split(" ").some((w) => w.startsWith(tok))) {
      score += 20;
      hit = true;
    }

    // Word-prefix in any alias ("bb58" → alias "bb58", "sub" → "submariner no date")
    if (aliasNorms.some((a) => a.split(" ").some((w) => w.startsWith(tok)))) {
      score += 20;
      hit = true;
    }

    if (hit) tokensHit++;
  }

  // ── Penalty: multi-token queries where not all tokens matched ─────────────
  if (queryTokens.length > 1 && tokensHit < queryTokens.length) {
    const hitRatio = tokensHit / queryTokens.length;
    if (hitRatio === 0) return 0;
    score = Math.floor(score * hitRatio * 0.7);
  }

  // Minimum relevance threshold
  return score >= 20 ? score : 0;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Search the watch database for a given query string.
 * Returns up to `limit` results sorted by relevance score (descending).
 * Returns an empty array when the query is shorter than 1 character.
 */
export function search(query: string, limit = 6): SearchResult[] {
  const q = query.trim();
  if (q.length < 1) return [];

  const qNorm   = norm(q);
  const qTokens = tokens(q);

  const results: SearchResult[] = [];

  for (const [key, watch] of Object.entries(watchDatabase)) {
    const score = scoreWatch(key, watch, qNorm, qTokens);
    if (score > 0) {
      results.push({ key, watch, currentPrice: getCurrentPrice(watch), score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ─── Highlight helper (used by SearchBar) ──────────────────────────────────────

export interface HighlightSegment {
  text: string;
  highlight: boolean;
}

/**
 * Split `text` into highlighted / non-highlighted segments based on `query`.
 * Matches are case-insensitive and are bounded to word starts when the query
 * is a single token (so "sub" highlights "Sub" in "Submariner" but not in "ubs").
 */
export function highlight(text: string, query: string): HighlightSegment[] {
  if (!query.trim()) return [{ text, highlight: false }];

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts
    .filter((p) => p.length > 0)
    .map((part) => ({
      text: part,
      highlight: regex.test(part),
    }));
}
