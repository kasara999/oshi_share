import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export type HistoryEntry = {
  matchId: string;
  matchedAt: string;
  myCardId: string;
  theirCard: {
    oshi_name: string;
    image_path: string | null;
    tags: string[];
  };
  iLiked: boolean;    // 自分が相手にいいねしたか
  theyLiked: boolean; // 相手が自分にいいねしたか
};

// GET /api/history
// X-Sender-Token ヘッダーを元に自分が関わったマッチ履歴を返す
export async function GET(request: NextRequest) {
  const senderToken = request.headers.get("X-Sender-Token");
  if (!senderToken || !supabaseAdmin) {
    return NextResponse.json({ entries: [] });
  }

  // 自分のカード ID を全件取得
  const { data: myCards } = await supabaseAdmin
    .from("cards")
    .select("id")
    .eq("sender_token", senderToken);

  if (!myCards || myCards.length === 0) {
    return NextResponse.json({ entries: [] });
  }

  const myCardIds = myCards.map((c: { id: string }) => c.id);

  // 自分のカードが card_id_1 または card_id_2 のマッチを取得
  const { data: matches } = await supabaseAdmin
    .from("matches")
    .select("*")
    .or(`card_id_1.in.(${myCardIds.join(",")}),card_id_2.in.(${myCardIds.join(",")})`)
    .order("matched_at", { ascending: false });

  if (!matches || matches.length === 0) {
    return NextResponse.json({ entries: [] });
  }

  // 各マッチで「相手のカード ID」を特定して情報を取得
  const entries: HistoryEntry[] = [];

  for (const match of matches) {
    const isSide1 = myCardIds.includes(match.card_id_1);
    const myCardId = isSide1 ? match.card_id_1 : match.card_id_2;
    const theirCardId = isSide1 ? match.card_id_2 : match.card_id_1;

    const { data: theirCard } = await supabaseAdmin
      .from("cards")
      .select("oshi_name, image_path, tags")
      .eq("id", theirCardId)
      .single();

    if (!theirCard) continue;

    entries.push({
      matchId: match.id,
      matchedAt: match.matched_at,
      myCardId,
      theirCard,
      iLiked: isSide1 ? match.liked_1 : match.liked_2,
      theyLiked: isSide1 ? match.liked_2 : match.liked_1,
    });
  }

  return NextResponse.json({ entries });
}
