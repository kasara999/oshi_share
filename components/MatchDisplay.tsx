"use client";

// マッチ後の画面: 自分と相手の推しカードを並べて表示する
// like ボタンで相手の推しにいいねできる

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSenderStore } from "@/store/senderStore";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { Card } from "@/types";

type Props = {
  matchId: string;
  card1: Card;   // 待機していた側のカード
  card2: Card;   // マッチさせた側のカード
  myCardId: string | null;      // URLパラメータから来る「自分のカードID」
  initialLiked1: boolean;
  initialLiked2: boolean;
};

// カードの見た目（画像・名前・説明・タグを表示）
function CardView({ card }: { card: Card }) {
  const publicUrl = card.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/card-images/${card.image_path}`
    : null;

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
      {publicUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={publicUrl}
          alt={card.oshi_name}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-zinc-50 flex items-center justify-center text-zinc-300 text-6xl">
          ?
        </div>
      )}
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-bold text-zinc-900">{card.oshi_name}</h2>
        {card.description && (
          <p className="text-sm text-zinc-500 leading-relaxed">{card.description}</p>
        )}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {card.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchDisplay({
  matchId,
  card1,
  card2,
  myCardId,
  initialLiked1,
  initialLiked2,
}: Props) {
  const [liked1, setLiked1] = useState(initialLiked1);
  const [liked2, setLiked2] = useState(initialLiked2);
  const [liking, setLiking] = useState(false);
  const senderToken = useSenderStore((state) => state.token);

  // myCardId からどちら側かを判断する
  // side 1 = 待機していた人（card1 が自分）
  // side 2 = マッチさせた人（card2 が自分）
  const mySide: 1 | 2 | null =
    myCardId === card1.id ? 1 : myCardId === card2.id ? 2 : null;

  const myCard   = mySide === 1 ? card1 : mySide === 2 ? card2 : null;
  const theirCard = mySide === 1 ? card2 : mySide === 2 ? card1 : null;

  // 自分がいいねしたか / 相手がいいねしたか
  const iLiked   = mySide === 1 ? liked1 : liked2;
  const theyLiked = mySide === 1 ? liked2 : liked1;

  // 相手の推しにいいねを送る
  const handleLike = async () => {
    if (iLiked || liking) return;
    setLiking(true);
    try {
      const res = await fetch(`/api/like/${matchId}`, {
        method: "POST",
        headers: { "X-Sender-Token": senderToken },
      });
      if (res.ok) {
        if (mySide === 1) setLiked1(true);
        if (mySide === 2) setLiked2(true);
      }
    } finally {
      setLiking(false);
    }
  };

  // Realtime: 相手がいいねしたとき即座に画面を更新する
  useEffect(() => {
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          setLiked1(payload.new.liked_1);
          setLiked2(payload.new.liked_2);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* ヘッダー */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900">マッチしました</h1>
          <p className="text-sm text-zinc-400">お互いの推しを見てみよう</p>
        </div>

        {/* 2枚のカードを横に並べる（スマホでは縦積み） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 相手の推し */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-400 tracking-widest uppercase">
              相手の推し
            </p>
            <CardView card={theirCard ?? (mySide === 1 ? card2 : card1)} />
            {mySide && (
              <Button
                className="w-full"
                variant={iLiked ? "outline" : "default"}
                onClick={handleLike}
                disabled={iLiked || liking}
              >
                <Heart className={`mr-2 h-4 w-4 ${iLiked ? "fill-current" : ""}`} />
                {iLiked ? "いいね済み" : "いいね！"}
              </Button>
            )}
            {theyLiked && (
              <p className="text-xs text-center text-zinc-400">相手もいいねしています</p>
            )}
          </div>

          {/* あなたの推し */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-400 tracking-widest uppercase">
              あなたの推し
            </p>
            <CardView card={myCard ?? (mySide === 2 ? card2 : card1)} />
            {iLiked && (
              <p className="text-xs text-center text-zinc-400">いいねを送りました</p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
