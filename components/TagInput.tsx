"use client"; // このコンポーネントはブラウザで動く（ユーザー操作を扱うため）

// タグの入力・追加・削除を管理するコンポーネント
// 使い方: テキストを入力して Enter または「,」で区切るとタグが追加される
//
// 【Props とは】
//   コンポーネントに外から渡すデータ。
//   tags: 現在のタグ配列（親が管理）
//   onChange: タグが変わったときに親へ通知する関数

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export function TagInput({ tags, onChange }: Props) {
  // inputValue: テキストボックスに今入力されている文字
  const [inputValue, setInputValue] = useState("");

  // タグを追加する処理
  const addTag = () => {
    const trimmed = inputValue.trim();
    // 空 or すでに同じタグがある場合は追加しない
    if (!trimmed || tags.includes(trimmed)) {
      setInputValue("");
      return;
    }
    // 親コンポーネントに新しいタグ配列を渡す
    onChange([...tags, trimmed]);
    setInputValue(""); // 入力欄をリセット
  };

  // キーボード操作: Enter か , (カンマ) でタグを追加
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // Enter でフォームが送信されるのを防ぐ
      addTag();
    }
    // Backspace で入力欄が空のとき、最後のタグを削除
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onChange(tags.slice(0, -1)); // 最後の要素を除いた配列を渡す
    }
  };

  // タグを削除する処理
  const removeTag = (tagToRemove: string) => {
    // filter: 削除したいタグ以外だけ残した新しい配列を作る
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10 focus-within:ring-2 focus-within:ring-ring">
      {/* 既存のタグを一覧表示 */}
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 text-sm">
          {tag}
          {/* × ボタンでタグを削除 */}
          <button
            type="button" // type="button" がないと form の submit が発火してしまう
            onClick={() => removeTag(tag)}
            className="hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* 新しいタグの入力欄 */}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag} // 入力欄からフォーカスが外れたときも追加
        placeholder={tags.length === 0 ? "タグを入力（Enter で追加）" : ""}
        className="border-none shadow-none focus-visible:ring-0 flex-1 min-w-24 h-auto p-0"
      />
    </div>
  );
}
