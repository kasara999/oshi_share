import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { CreateCardResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { card_id, oshi_name, description, tags, external_url, image_path } = body;
    const senderToken = request.headers.get("X-Sender-Token");

    if (!senderToken) {
      return NextResponse.json({ error: "送信者トークンがありません" }, { status: 400 });
    }
    if (!oshi_name || typeof oshi_name !== "string" || oshi_name.trim() === "") {
      return NextResponse.json({ error: "推しの名前は必須です" }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "サーバー設定エラー" }, { status: 500 });
    }

    // カードを DB に保存
    const { data, error } = await supabaseAdmin
      .from("cards")
      .insert({
        ...(card_id ? { id: card_id } : {}),
        sender_token: senderToken,
        oshi_name: oshi_name.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        external_url: external_url?.trim() || null,
        image_path: image_path || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("カード作成エラー:", error);
      return NextResponse.json({ error: "カードの作成に失敗しました" }, { status: 500 });
    }

    // 待機中のカードとマッチングを試みる
    // match_with_card: 待機カードを1枚選んで両方を matched に更新し match_id を返す
    // マッチ相手がいない場合は null が返る
    const { data: matchId, error: matchError } = await supabaseAdmin
      .rpc("match_with_card", {
        p_new_card_id: data.id,
        p_sender_token: senderToken,
      });

    if (matchError) {
      console.error("マッチングエラー:", matchError);
    }

    const response: CreateCardResponse = {
      card_id: data.id,
      match_id: matchId ?? null,
    };
    return NextResponse.json(response, { status: 201 });

  } catch (e) {
    console.error("予期しないエラー:", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
