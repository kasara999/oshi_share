import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { matchId } = await params;
    const senderToken = request.headers.get("X-Sender-Token");

    if (!matchId) {
      return NextResponse.json({ error: "matchId が必要です" }, { status: 400 });
    }
    if (!senderToken) {
      return NextResponse.json({ error: "X-Sender-Token が必要です" }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase が設定されていません" }, { status: 503 });
    }

    // matches と両カードの sender_token を一緒に取得する
    const { data: match, error: matchError } = await supabaseAdmin
      .from("matches")
      .select("card_id_1, card_id_2")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: "マッチが見つかりません" }, { status: 404 });
    }

    const [{ data: card1 }, { data: card2 }] = await Promise.all([
      supabaseAdmin.from("cards").select("sender_token").eq("id", match.card_id_1).single(),
      supabaseAdmin.from("cards").select("sender_token").eq("id", match.card_id_2).single(),
    ]);

    // sender_token でどちら側かを判定して対応するカラムを更新
    let updateField: "liked_1" | "liked_2" | null = null;
    if (card1?.sender_token === senderToken) updateField = "liked_1";
    if (card2?.sender_token === senderToken) updateField = "liked_2";

    if (!updateField) {
      return NextResponse.json({ error: "このマッチへのいいね権限がありません" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("matches")
      .update({ [updateField]: true })
      .eq("id", matchId);

    if (error) {
      console.error("いいね更新エラー:", error);
      return NextResponse.json({ error: "いいねの更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
