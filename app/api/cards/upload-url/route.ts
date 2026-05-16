// POST /api/cards/upload-url
// Supabase Storage への署名付きアップロード URL を発行する API
//
// 【なぜ署名付きURLが必要か】
//   画像をそのまま Next.js サーバーに送ると、サーバーのメモリを大量に消費する。
//   代わりに「このURLに直接アップロードしていいよ」という一時的な URL を発行して、
//   ブラウザから Supabase Storage へ直接送る設計にする。
//   この URL は60秒で無効になるので、漏れても安全。

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { UploadUrlResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { card_id } = await request.json();

    if (!card_id || typeof card_id !== "string") {
      return NextResponse.json(
        { error: "card_id が必要です" },
        { status: 400 }
      );
    }

    // Storage 内のファイルパスを決める
    // 例: "cards/abc-123/image.webp"
    // card_id ごとにフォルダを分けることで、別のカードの画像と混ざらない
    const imagePath = `cards/${card_id}/image.webp`;

    // 署名付きアップロード URL を生成
    // createSignedUploadUrl: 指定パスへのアップロードを一時的に許可する URL を返す
    const { data, error } = await supabaseAdmin.storage
      .from("card-images")       // バケット名
      .createSignedUploadUrl(imagePath, {
        upsert: true,            // 同じパスに上書きアップロードを許可
      });

    if (error || !data) {
      console.error("署名付きURL生成エラー:", error);
      return NextResponse.json(
        { error: "アップロードURLの生成に失敗しました" },
        { status: 500 }
      );
    }

    const response: UploadUrlResponse = {
      upload_url: data.signedUrl, // ブラウザはこのURLに直接PUTリクエストを送る
      image_path: imagePath,      // DBに保存するパス
    };

    return NextResponse.json(response);

  } catch (e) {
    console.error("予期しないエラー:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
