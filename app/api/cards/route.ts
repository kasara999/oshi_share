// POST /api/cards
// カードを DB に保存する API Route
//
// 【API Route とは】
//   Next.js の「サーバー側だけで動くコード」。
//   ブラウザから fetch() で呼び出すと、このファイルが実行される。
//   secret キーを使う処理や DB 操作はここで行う（ブラウザに秘密情報を渡さないため）。

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { CreateCardResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディ（ブラウザから送られてきた JSON）を取得
    const body = await request.json();
    // card_id: フォームで事前生成した UUID。Storage パスと一致させるために受け取る
    const { card_id, oshi_name, description, tags, external_url, image_path } = body;

    // 送信者トークンをヘッダーから取得
    // ブラウザ側で localStorage に保存した UUID を X-Sender-Token ヘッダーで送ってもらう
    const senderToken = request.headers.get("X-Sender-Token");

    // ── バリデーション ──────────────────────────────────────
    // 必須項目が欠けていたら 400 Bad Request を返す
    if (!senderToken) {
      return NextResponse.json(
        { error: "送信者トークンがありません" },
        { status: 400 }
      );
    }
    if (!oshi_name || typeof oshi_name !== "string" || oshi_name.trim() === "") {
      return NextResponse.json(
        { error: "推しの名前は必須です" },
        { status: 400 }
      );
    }

    // ── DB への保存 ─────────────────────────────────────────
    // supabaseAdmin は service_role キーを使うので RLS をバイパスして書き込める
    const { data, error } = await supabaseAdmin
      .from("cards")
      .insert({
        // card_id が渡されていれば使う（画像パスと一致させるため）
        ...(card_id ? { id: card_id } : {}),
        sender_token: senderToken,
        oshi_name: oshi_name.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        external_url: external_url?.trim() || null,
        image_path: image_path || null,
      })
      // insert した行の id だけ返してもらう（データ全体は不要）
      .select("id")
      .single(); // 1行だけ返す（配列ではなくオブジェクトで返ってくる）

    if (error) {
      console.error("カード作成エラー:", error);
      return NextResponse.json(
        { error: "カードの作成に失敗しました" },
        { status: 500 }
      );
    }

    // 成功: 作成したカードの ID をブラウザに返す
    // ブラウザはこの ID を使って待機画面のURLを作る（/send/waiting/[cardId]）
    const response: CreateCardResponse = { card_id: data.id };
    return NextResponse.json(response, { status: 201 });

  } catch (e) {
    console.error("予期しないエラー:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
