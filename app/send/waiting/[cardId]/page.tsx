"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function WaitingPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const router = useRouter();

  useEffect(() => {
    // matches テーブルの INSERT を監視する
    // 待機中のカードは必ず card_id_1 として登録されるのでそちらをフィルタ
    const channel = supabase
      .channel(`waiting-${cardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `card_id_1=eq.${cardId}`,
        },
        (payload) => {
          // 誰かがマッチした → マッチ画面へ移動
          // myCard パラメータで「自分のカードはどれか」を伝える
          router.push(`/match/${payload.new.id}?myCard=${cardId}`);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [cardId, router]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="text-6xl animate-bounce">✉️</div>
        <h1 className="text-xl font-bold text-zinc-900">推しをお届け中...</h1>
        <p className="text-sm text-zinc-400">
          あなたの推しを送った誰かとマッチするのを待っています
        </p>
      </div>
    </main>
  );
}
