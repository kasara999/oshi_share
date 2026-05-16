import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const { matchId } = params;
    if (!matchId) {
      return NextResponse.json({ error: "matchId が必要です" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("matches")
      .update({ liked: true })
      .eq("id", matchId);

    if (error) {
      console.error("like update error:", error);
      return NextResponse.json({ error: "いいねの更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
