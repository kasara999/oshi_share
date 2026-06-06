import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (!q) return NextResponse.json({ tags: [] });
  if (!supabaseAdmin) return NextResponse.json({ tags: [] });

  try {
    const { data } = await supabaseAdmin
      .from("cards")
      .select("tags")
      .limit(500);

    const flat: string[] = (data ?? []).flatMap((c: { tags: string[] }) => c.tags ?? []);
    const unique = [...new Set(flat)];
    const filtered = unique
      .filter((t) => t.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 20);

    return NextResponse.json({ tags: filtered });
  } catch {
    return NextResponse.json({ tags: [] });
  }
}
