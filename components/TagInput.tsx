"use client"; // このコンポーネントはブラウザで動く（ユーザー操作を扱うため）

// タグ選択コンポーネント
// あらかじめ用意されたタグの中から最大3つまで選べる
//
// 【Props とは】
//   コンポーネントに外から渡すデータ。
//   tags: 現在選択中のタグ配列（親が管理）
//   onChange: タグが変わったときに親へ通知する関数

import { Badge } from "@/components/ui/badge";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

// 選べるタグの定義
// グループごとにまとめておくと UI で区切り線を出しやすい
const TAG_GROUPS = [
  {
    label: "ジャンル",
    tags: ["ゲーム", "アニメ", "漫画", "VTuber", "俳優", "歌手", "偉人", "作家", "作曲家", "アイドル"],
  },
  {
    label: "属性",
    tags: ["男性", "女性", "2次元", "3次元"],
  },
  {
    label: "印象",
    tags: ["かっこいい", "かわいい"],
  },
];

const MAX_TAGS = 3; // 最大選択数

export function TagInput({ tags, onChange }: Props) {
  // タグをクリックしたとき: 選択中なら外し、未選択なら追加（ただし上限3つ）
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      // すでに選択中 → 外す
      onChange(tags.filter((t) => t !== tag));
    } else if (tags.length < MAX_TAGS) {
      // 上限未満 → 追加
      onChange([...tags, tag]);
    }
    // 上限に達していて未選択のタグはクリックしても何もしない
  };

  return (
    <div className="space-y-3">
      {/* 上限に近づいたら案内を表示 */}
      <p className="text-xs text-muted-foreground">
        最大 {MAX_TAGS} つまで選択できます（{tags.length}/{MAX_TAGS}）
      </p>

      {TAG_GROUPS.map((group) => (
        <div key={group.label}>
          {/* グループ名 */}
          <p className="text-xs text-muted-foreground mb-1.5">{group.label}</p>

          {/* タグ一覧: クリックで選択・解除 */}
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => {
              const isSelected = tags.includes(tag);
              // 上限に達していて未選択のタグはグレーアウト
              const isDisabled = !isSelected && tags.length >= MAX_TAGS;

              return (
                <button
                  key={tag}
                  type="button" // type="button" を明示しないと form の submit が発火する
                  onClick={() => toggleTag(tag)}
                  disabled={isDisabled}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      cursor-pointer transition-colors
                      ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-primary/10"}
                      ${isSelected ? "hover:bg-primary/80" : ""}
                    `}
                  >
                    {tag}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
