import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// GET /api/tags?q=検索ワード
// cardsテーブルに登録されているタグをキーワードで検索して返す
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (!q) return NextResponse.json({ tags: [] });
  if (!supabaseAdmin) return NextResponse.json({ tags: [] });

  try {
    // cardsテーブルからtagsカラム（配列）を一括取得
    const { data } = await supabaseAdmin
      .from("cards")
      .select("tags")
      .limit(500);

    // 全カードのtagsをフラットにして重複を除いたあと、検索ワードで絞り込む
    const allTags = [...new Set((data ?? []).flatMap((c: { tags: string[] }) => c.tags ?? []))];
    const filtered = allTags
      .filter((t) => t.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 20);

    return NextResponse.json({ tags: filtered });
  } catch {
    return NextResponse.json({ tags: [] });
  }
}
