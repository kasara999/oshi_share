"use client"; // Supabase Realtime の購読はブラウザでしか動かないため

// /send/waiting/[cardId] ページ
// カードを送信後の待機画面。誰かが受け取るとリアルタイムで通知される。
//
// 【[cardId] とは】
//   フォルダ名を [] で囲むと「動的ルート」になる。
//   /send/waiting/abc-123 にアクセスすると cardId = "abc-123" として扱われる。

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// マッチング状態の型
type MatchStatus =
  | "waiting"   // 待機中
  | "matched"   // 誰かが受け取った（でもまだいいねしていない）
  | "liked";    // いいねされた

export default function WaitingPage() {
  // useParams: URLの動的部分（[cardId]）を取得する Next.js のフック
  const { cardId } = useParams<{ cardId: string }>();

  const [status, setStatus] = useState<MatchStatus>("waiting");

  useEffect(() => {
    // ── Supabase Realtime の購読 ──────────────────────────────
    // 【Realtime とは】
    //   DB のデータが変わったときにブラウザへ即座に通知する仕組み。
    //   普通はブラウザから「変わった？」と定期的に問い合わせる（ポーリング）が、
    //   Realtime を使えばサーバーから「変わったよ」と教えてもらえる。
    //
    // channel: 購読チャンネルを作る（チャンネル名は一意であれば何でもOK）
    const channel = supabase
      .channel(`waiting-${cardId}`)
      .on(
        "postgres_changes",  // DB の変更を監視するイベント
        {
          event: "INSERT",   // INSERT（新しい行が追加された）を監視
          schema: "public",
          table: "matches",
          filter: `card_id=eq.${cardId}`, // このカードIDのマッチングだけ監視
        },
        (payload) => {
          // 誰かが受け取った！
          setStatus(payload.new.liked ? "liked" : "matched");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",   // UPDATE（行が更新された）を監視
          schema: "public",
          table: "matches",
          filter: `card_id=eq.${cardId}`,
        },
        (payload) => {
          // いいねされた！
          if (payload.new.liked) {
            setStatus("liked");
          }
        }
      )
      .subscribe(); // 購読開始

    // クリーンアップ: ページを離れたときに購読を解除する
    // 【useEffect の return】
    //   return した関数はコンポーネントが消えるときに実行される。
    //   購読を解除しないとメモリリークになる。
    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardId]); // cardId が変わったら再実行（通常は変わらない）

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="mx-auto max-w-sm px-4 text-center space-y-6">

        {status === "waiting" && (
          <>
            {/* アニメーションする瓶のアイコン */}
            <div className="text-6xl animate-bounce">🍶</div>
            <h1 className="text-xl font-bold">推しを届け中...</h1>
            <p className="text-sm text-muted-foreground">
              誰かがあなたの推しを受け取るのを待っています
            </p>
          </>
        )}

        {status === "matched" && (
          <>
            <div className="text-6xl">📬</div>
            <h1 className="text-xl font-bold">受け取られました！</h1>
            <p className="text-sm text-muted-foreground">
              いいねを待っています...
            </p>
          </>
        )}

        {status === "liked" && (
          <>
            <div className="text-6xl animate-pulse">💖</div>
            <h1 className="text-xl font-bold">いいねされました！</h1>
            <p className="text-sm text-muted-foreground">
              あなたの推しが気に入ってもらえたようです
            </p>
          </>
        )}

      </div>
    </main>
  );
}
