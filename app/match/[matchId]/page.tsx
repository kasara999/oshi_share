import { supabaseAdmin } from "@/lib/supabase/server";
import MatchDisplay from "@/components/MatchDisplay";

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ myCard?: string }>;
}) {
  const { matchId } = await params;
  const { myCard } = await searchParams;

  if (!supabaseAdmin) {
    return <div className="p-6">サーバー設定エラー</div>;
  }

  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) {
    return <div className="p-6">マッチ情報が見つかりませんでした</div>;
  }

  const [{ data: card1 }, { data: card2 }] = await Promise.all([
    supabaseAdmin.from("cards").select("*").eq("id", match.card_id_1).single(),
    supabaseAdmin.from("cards").select("*").eq("id", match.card_id_2).single(),
  ]);

  if (!card1 || !card2) {
    return <div className="p-6">カード情報が見つかりませんでした</div>;
  }

  return (
    <MatchDisplay
      matchId={matchId}
      card1={card1}
      card2={card2}
      myCardId={myCard ?? null}
      initialLiked1={match.liked_1}
      initialLiked2={match.liked_2}
    />
  );
}
