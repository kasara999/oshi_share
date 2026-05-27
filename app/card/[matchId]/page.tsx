import { supabaseAdmin } from '@/lib/supabase/server';
import CardDisplay from '@/components/CardDisplay';
import LikeButton from '@/components/LikeButton';

// Next.js 15 では params は Promise なので await して使う
export default async function Page({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const resolvedParams = await params;
  const { matchId } = resolvedParams;
  if (!supabaseAdmin) {
    return (
      <div className="p-6">
        Supabase が設定されていません（環境変数を確認してください）
      </div>
    );
  }

  // match 情報を取得
  const { data: matchData, error: matchError } = await supabaseAdmin
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (matchError || !matchData) {
    return <div className="p-6">マッチ情報が見つかりませんでした。</div>;
  }

  const cardId = matchData.card_id;
  const { data: cardData, error: cardError } = await supabaseAdmin
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (cardError || !cardData) {
    return <div className="p-6">カード情報が見つかりませんでした。</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <CardDisplay card={cardData} />
      <div className="mt-4">
        <LikeButton matchId={matchId} />
      </div>
    </div>
  );
}
