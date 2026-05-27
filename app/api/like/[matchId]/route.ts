import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Next.js 15 では動的ルートのパラメータが Promise になった
// { params }: { params: Promise<{ matchId: string }> } という形で受け取る
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    // await で Promise を解決してから matchId を取得する
    const { matchId } = await params;

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId が必要です' },
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase が設定されていません' },
        { status: 503 },
      );
    }

    const { error } = await supabaseAdmin
      .from('matches')
      .update({ liked: true })
      .eq('id', matchId);

    if (error) {
      console.error('like update error:', error);
      return NextResponse.json(
        { error: 'いいねの更新に失敗しました' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
