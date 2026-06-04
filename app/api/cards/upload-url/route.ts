import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { UploadUrlResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { card_id } = await request.json();

    if (!card_id || typeof card_id !== "string") {
      return NextResponse.json({ error: "card_id が必要です" }, { status: 400 });
    }

    // supabaseAdmin が null = 環境変数が設定されていない
    if (!supabaseAdmin) {
      console.error("supabaseAdmin が null。.env.local の SUPABASE_SERVICE_ROLE_KEY を確認してください");
      return NextResponse.json({ error: "サーバー設定エラー" }, { status: 500 });
    }

    const imagePath = `cards/${card_id}/image.webp`;

    const { data, error } = await supabaseAdmin.storage
      .from("card-images")
      .createSignedUploadUrl(imagePath, { upsert: true });

    if (error || !data) {
      console.error("署名付きURL生成エラー:", JSON.stringify(error));
      return NextResponse.json({ error: "アップロードURLの生成に失敗しました" }, { status: 500 });
    }

    const response: UploadUrlResponse = {
      upload_url: data.signedUrl,
      image_path: imagePath,
    };

    return NextResponse.json(response);

  } catch (e) {
    console.error("予期しないエラー:", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
