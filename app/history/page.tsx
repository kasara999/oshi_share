"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSenderStore } from "@/store/senderStore";
import type { HistoryEntry } from "@/app/api/history/route";

// 日時を「3日前」「2時間前」のような形式に変換する
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  if (hour < 24) return `${hour}時間前`;
  return `${day}日前`;
}

export default function HistoryPage() {
  const router = useRouter();
  const senderToken = useSenderStore((state) => state.token);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!senderToken) return;
    fetch("/api/history", {
      headers: { "X-Sender-Token": senderToken },
    })
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .finally(() => setLoading(false));
  }, [senderToken]);

  const publicUrl = (imagePath: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/card-images/${imagePath}`;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-10">

        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-400 hover:text-zinc-600 mb-4 block"
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-zinc-900">マッチ履歴</h1>
          <p className="text-sm text-zinc-400 mt-1">これまでマッチした相手の推し</p>
        </div>

        {loading && (
          <p className="text-sm text-zinc-400 text-center py-20">読み込み中...</p>
        )}

        {!loading && entries.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-20">
            まだマッチ履歴がありません
          </p>
        )}

        <div className="space-y-3">
          {entries.map((entry) => (
            <button
              key={entry.matchId}
              onClick={() =>
                router.push(`/match/${entry.matchId}?myCard=${entry.myCardId}`)
              }
              className="w-full text-left border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-400 transition-colors flex gap-4 p-3"
            >
              {/* サムネイル */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
                {entry.theirCard.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={publicUrl(entry.theirCard.image_path)}
                    alt={entry.theirCard.oshi_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 text-2xl">
                    ?
                  </div>
                )}
              </div>

              {/* テキスト */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 truncate">
                  {entry.theirCard.oshi_name}
                </p>
                {entry.theirCard.tags.length > 0 && (
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    {entry.theirCard.tags.join(" · ")}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-zinc-300">{timeAgo(entry.matchedAt)}</span>
                  {entry.iLiked && entry.theyLiked && (
                    <span className="text-xs text-zinc-500">お互いいいね</span>
                  )}
                  {entry.iLiked && !entry.theyLiked && (
                    <span className="text-xs text-zinc-400">いいねした</span>
                  )}
                  {!entry.iLiked && entry.theyLiked && (
                    <span className="text-xs text-zinc-400">いいねされた</span>
                  )}
                </div>
              </div>

              <div className="text-zinc-300 self-center">›</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
