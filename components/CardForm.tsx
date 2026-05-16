"use client"; // フォームの入力状態を管理するのでブラウザで動く

// 推しカードの作成フォーム
// 入力内容を useState で管理し、送信時に /api/cards を呼び出す

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/TagInput";
import { useSenderStore } from "@/store/senderStore";
import type { CardFormData } from "@/types";

export function CardForm() {
  // useRouter: ページ遷移に使う Next.js のフック
  const router = useRouter();

  // Zustand ストアから匿名ID（送信者トークン）を取得
  const senderToken = useSenderStore((state) => state.token);

  // フォームの入力値を管理する state
  // 【useState とは】
  //   コンポーネント内の「変数」。値が変わると画面が自動で再描画される。
  const [formData, setFormData] = useState<CardFormData>({
    oshi_name: "",
    description: "",
    tags: [],
    external_url: "",
    image_file: null,
  });

  // 送信中かどうか（二重送信防止・ボタンの無効化に使う）
  const [isSubmitting, setIsSubmitting] = useState(false);

  // エラーメッセージ
  const [error, setError] = useState<string | null>(null);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault(): ブラウザのデフォルト動作（ページリロード）を止める
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // /api/cards に POST リクエストを送る
      // fetch: ブラウザ標準のHTTPリクエスト関数
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 匿名IDをヘッダーに付けてサーバーに送る
          "X-Sender-Token": senderToken,
        },
        // body: リクエストに含めるデータ（JSON文字列に変換して送る）
        body: JSON.stringify({
          oshi_name: formData.oshi_name,
          description: formData.description,
          tags: formData.tags,
          external_url: formData.external_url,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      const data = await response.json();

      // 成功したら待機画面へ遷移
      // router.push: JavaScript でページ遷移する（ブラウザのURLが変わる）
      router.push(`/send/waiting/${data.card_id}`);

    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      // finally: 成功・失敗どちらでも必ず実行される
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 推しの名前 */}
      <div className="space-y-2">
        <Label htmlFor="oshi_name">推しの名前 *</Label>
        <Input
          id="oshi_name"
          value={formData.oshi_name}
          onChange={(e) =>
            // スプレッド構文で既存の値を保持しつつ、oshi_name だけ更新
            setFormData({ ...formData, oshi_name: e.target.value })
          }
          placeholder="例: 春日野穹"
          required
          maxLength={50}
        />
      </div>

      {/* 説明 */}
      <div className="space-y-2">
        <Label htmlFor="description">どこが好き？</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="推しの魅力を書いてください..."
          rows={4}
          maxLength={500}
        />
        {/* 文字数カウンター */}
        <p className="text-xs text-muted-foreground text-right">
          {formData.description.length} / 500
        </p>
      </div>

      {/* タグ */}
      <div className="space-y-2">
        <Label>タグ</Label>
        <TagInput
          tags={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
        />
        <p className="text-xs text-muted-foreground">
          Enter または , で追加。例: 女性、ゲーム、グラブル
        </p>
      </div>

      {/* 関連URL */}
      <div className="space-y-2">
        <Label htmlFor="external_url">関連URL（任意）</Label>
        <Input
          id="external_url"
          type="url"
          value={formData.external_url}
          onChange={(e) =>
            setFormData({ ...formData, external_url: e.target.value })
          }
          placeholder="https://..."
        />
      </div>

      {/* エラー表示 */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* 送信ボタン */}
      <Button
        type="submit"
        className="w-full"
        // 送信中はボタンを無効化して二重送信を防ぐ
        disabled={isSubmitting}
      >
        {isSubmitting ? "送信中..." : "推しを送る 🍶"}
      </Button>
    </form>
  );
}
