import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { MatchResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const recipientToken = request.headers.get('X-Recipient-Token');
    if (!recipientToken) {
      return NextResponse.json(
        { error: '受取人トークンがありません' },
        { status: 400 },
      );
    }

    // サーバー設定がない場合は早期リターン
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase が設定されていません' },
        { status: 503 },
      );
    }

    // DB 側の関数を呼んでランダムにカードを確保する
    const { data, error } = await supabaseAdmin.rpc('claim_random_card', {
      p_recipient_token: recipientToken,
    });

    if (error) {
      console.error('claim_random_card error:', error);
      return NextResponse.json(
        { error: 'マッチング中にエラーが発生しました' },
        { status: 500 },
      );
    }

    // 空の結果（マッチするカードがなかった）
    if (!data || (Array.isArray(data) && data.length === 0)) {
      const empty: MatchResponse = { match_id: null, card_id: null };
      return NextResponse.json(empty, { status: 200 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    const matchId = row.match_id as string;
    const cardId = row.card_id as string;

    // マッチしたカードの詳細を取得して返す
    const { data: cardData, error: cardError } = await supabaseAdmin
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (cardError) {
      console.error('fetch card error:', cardError);
      return NextResponse.json(
        { error: 'カード情報の取得に失敗しました' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { match_id: matchId, card_id: cardId, card: cardData },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
