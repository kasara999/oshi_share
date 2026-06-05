"use client";

// タグ選択コンポーネント
// ・定義済みタグ: バッジをクリックして選択/解除
// ・カスタムタグ: テキストを入力して「追加」ボタンで追加
// ・他の人のタグ検索: 入力中にDBから候補を表示

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

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

const MAX_TAGS = 5;
const ALL_PREDEFINED = TAG_GROUPS.flatMap((g) => g.tags);

export function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const customTags = tags.filter((t) => !ALL_PREDEFINED.includes(t));
  const isAtLimit = tags.length >= MAX_TAGS;

  // 定義済みタグのクリック: 選択/解除
  const togglePredefined = (tag: string) => {
    if (tags.includes(tag)) {
      onChange(tags.filter((t) => t !== tag));
    } else if (!isAtLimit) {
      onChange([...tags, tag]);
    }
  };

  // 「追加」ボタン: 入力テキストをタグとして追加
  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed) || isAtLimit) return;
    onChange([...tags, trimmed]);
    setInput("");
    setShowResults(false);
  };

  // 候補から選択
  const selectResult = (tag: string) => {
    if (tags.includes(tag) || isAtLimit) return;
    onChange([...tags, tag]);
    setInput("");
    setShowResults(false);
  };

  // 入力が変わったら300ms後にDB検索
  useEffect(() => {
    if (input.trim().length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(input)}`);
        const data = await res.json();
        // すでに選択中のタグは除外して表示
        setSearchResults((data.tags ?? []).filter((t: string) => !tags.includes(t)));
        setShowResults(true);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, tags]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        最大 {MAX_TAGS} つまで選択できます（{tags.length}/{MAX_TAGS}）
      </p>

      {/* 選択中のカスタムタグ */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <Badge key={tag} variant="default" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 定義済みタググループ */}
      {TAG_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs text-muted-foreground mb-1.5">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => {
              const isSelected = tags.includes(tag);
              const isDisabled = !isSelected && isAtLimit;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => togglePredefined(tag)}
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

      {/* カスタムタグ入力 */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">自分で追加 / 他の人のタグを検索</p>

        {/* 入力欄 + 追加ボタン */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enterキーでフォームが送信されるのを防ぐ
                if (e.key === "Enter") e.preventDefault();
                if (e.key === "Escape") setShowResults(false);
              }}
              onBlur={() => setTimeout(() => setShowResults(false), 150)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder={isAtLimit ? "上限（3つ）に達しました" : "タグを入力..."}
              disabled={isAtLimit}
              className="pl-8"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAdd}
            disabled={isAtLimit || !input.trim() || tags.includes(input.trim())}
          >
            追加
          </Button>
        </div>

        {/* 他の人のタグ候補ドロップダウン */}
        {showResults && searchResults.length > 0 && (
          <div className="border rounded-md shadow-sm bg-background overflow-hidden">
            <p className="px-3 py-1.5 text-xs text-muted-foreground border-b bg-muted/50">
              他の人が使っているタグ
            </p>
            <div className="max-h-40 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectResult(result)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  {result}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
