import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { containsBlockedWord } from "@/lib/blocklist";
import type { CreateCardResponse } from "@/types";

// ── バリデーション用ヘルパー ───────────────────────────────
// エラーメッセージを返す。問題なければ null を返す。

function validateOshiName(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return "推しの名前は必須です";
  if (value.trim().length > 50) return "推しの名前は50文字以内にしてください";
  return null;
}

function validateDescription(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null; // 任意項目
  if (typeof value !== "string") return "説明は文字列で入力してください";
  if (value.length > 500) return "説明は500文字以内にしてください";
  return null;
}

function validateTags(value: unknown): string | null {
  if (value === null || value === undefined) return null; // 任意項目
  if (!Array.isArray(value)) return "タグは配列で送信してください";
  if (value.length > 5) return "タグは5つ以内にしてください";
  for (const tag of value) {
    if (typeof tag !== "string") return "タグは文字列で入力してください";
    if (tag.length > 30) return "タグは1つ30文字以内にしてください";
  }
  return null;
}

function validateExternalUrl(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null; // 任意項目
  if (typeof value !== "string") return "URLは文字列で入力してください";
  // URL の形式チェック（http/https のみ許可）
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "URLは http または https で始めてください";
    }
  } catch {
    return "URLの形式が正しくありません";
  }
  return null;
}

function validateImagePath(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null; // 任意項目
  if (typeof value !== "string") return "image_path は文字列で送信してください";
  // Supabase Storage のパス形式チェック（例: cards/uuid/image.webp）
  if (!value.startsWith("cards/")) return "image_path の形式が正しくありません";
  return null;
}

function validateSenderToken(value: string | null): string | null {
  if (!value) return "送信者トークンがありません";
  // UUID v4 の形式チェック
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) return "送信者トークンの形式が不正です";
  return null;
}

// ── API Route ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { card_id, oshi_name, description, tags, external_url, image_path } = body;
    const senderToken = request.headers.get("X-Sender-Token");

    // 全フィールドをサーバー側でバリデーション
    // クライアント側の制限（maxLength など）は開発者ツールで迂回できるため
    const blockedFields = [
      typeof oshi_name === "string" && containsBlockedWord(oshi_name),
      typeof description === "string" && containsBlockedWord(description),
      Array.isArray(tags) && tags.some((t: unknown) => typeof t === "string" && containsBlockedWord(t)),
    ];

    const errors = [
      validateSenderToken(senderToken),
      validateOshiName(oshi_name),
      validateDescription(description),
      validateTags(tags),
      validateExternalUrl(external_url),
      validateImagePath(image_path),
      blockedFields.some(Boolean) ? "不適切な表現が含まれています" : null,
    ].filter(Boolean);

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "サーバー設定エラー" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("cards")
      .insert({
        ...(card_id ? { id: card_id } : {}),
        sender_token: senderToken!,
        oshi_name: (oshi_name as string).trim(),
        description: (description as string | undefined)?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        external_url: (external_url as string | undefined)?.trim() || null,
        image_path: image_path || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("カード作成エラー:", error);
      return NextResponse.json({ error: "カードの作成に失敗しました" }, { status: 500 });
    }

    const { data: matchId, error: matchError } = await supabaseAdmin
      .rpc("match_with_card", {
        p_new_card_id: data.id,
        p_sender_token: senderToken!,
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
