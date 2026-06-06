import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export type ExploreCard = {
  id: string;
  oshi_name: string;
  image_path: string | null;
  tags: string[];
  description: string | null;
};

// GET /api/explore?tag=アニメ
// タグで絞り込んでマッチ済みのカードを返す（waiting のカードはサプライズ感を守るため除外）
export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");

  if (!supabaseAdmin) return NextResponse.json({ cards: [] });

  let query = supabaseAdmin
    .from("cards")
    .select("id, oshi_name, image_path, tags, description")
    .eq("status", "matched")
    .order("created_at", { ascending: false })
    .limit(30);

  // タグが指定されている場合は配列の中にそのタグが含まれるものだけ返す
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("explore エラー:", error);
    return NextResponse.json({ cards: [] });
  }

  return NextResponse.json({ cards: data ?? [] });
}
