"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { ExploreCard } from "@/app/api/explore/route";

const ALL_TAGS = [
  "ゲーム", "アニメ", "漫画", "VTuber", "俳優", "歌手",
  "偉人", "作家", "作曲家", "アイドル",
  "男性", "女性", "2次元", "3次元",
  "かっこいい", "かわいい",
];

export default function ExplorePage() {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState("");
  const [searchedTags, setSearchedTags] = useState<string[]>([]);
  const [cards, setCards] = useState<ExploreCard[]>([]);
  const [loading, setLoading] = useState(false);

  // 検索ワードなし → 定義済みタグ一覧を表示
  // 検索ワードあり → DBから一致するタグを取得（カスタムタグも含む）
  const displayedTags = tagSearch.trim() ? searchedTags : ALL_TAGS;

  useEffect(() => {
    if (!tagSearch.trim()) {
      setSearchedTags([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/tags?q=${encodeURIComponent(tagSearch.trim())}`)
        .then((r) => r.json())
        .then((data) => setSearchedTags(data.tags ?? []));
    }, 300);
    return () => clearTimeout(timer);
  }, [tagSearch]);

  useEffect(() => {
    setLoading(true);
    const url = selectedTag
      ? `/api/explore?tag=${encodeURIComponent(selectedTag)}`
      : "/api/explore";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setCards(data.cards ?? []))
      .finally(() => setLoading(false));
  }, [selectedTag]);

  const publicUrl = (imagePath: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/card-images/${imagePath}`;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-400 hover:text-zinc-600 mb-4 block"
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-zinc-900">みんなの推しを探す</h1>
          <p className="text-sm text-zinc-400 mt-1">タグで絞り込めます</p>
        </div>

        {/* タグフィルター */}
        <div className="mb-8 space-y-3">
          {/* タグ検索入力 */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="タグを検索..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* タグボタン */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedTag === null
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              すべて
            </button>
            {tagSearch.trim() && displayedTags.length === 0 && (
              <p className="text-xs text-zinc-400 self-center">該当するタグがありません</p>
            )}
            {displayedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedTag === tag
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* カード一覧 */}
        {loading && (
          <p className="text-sm text-zinc-400 text-center py-20">読み込み中...</p>
        )}
        {!loading && cards.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-20">
            該当する推しが見つかりませんでした
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <div key={card.id} className="border border-zinc-200 rounded-xl overflow-hidden">
              <div className="aspect-square bg-zinc-50">
                {card.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={publicUrl(card.image_path)}
                    alt={card.oshi_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-200 text-4xl">
                    ?
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <p className="font-semibold text-zinc-900 text-sm truncate">{card.oshi_name}</p>
                {card.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                )}
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {card.tags.map((t) => (
                      <span key={t} className="text-xs px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
