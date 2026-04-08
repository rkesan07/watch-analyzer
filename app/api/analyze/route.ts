import { NextRequest, NextResponse } from "next/server";
import { watchDatabase } from "@/lib/watch-database";
import { scoreWatch } from "@/lib/scorer";
import { search } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  // Try exact reference key first, then fuzzy search
  let key: string | null = null;
  if (watchDatabase[query]) {
    key = query;
  } else {
    const results = search(query, 1);
    if (results.length > 0) {
      key = results[0].key;
    }
  }

  if (!key) {
    return NextResponse.json({ error: "Watch not found" }, { status: 404 });
  }

  const result = scoreWatch(watchDatabase[key]);
  return NextResponse.json(result);
}
