"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/TagInput";
import { ImageUploader } from "@/components/ImageUploader";
import { useSenderStore } from "@/store/senderStore";
import type { CardFormData } from "@/types";

export function CardForm() {
  const router = useRouter();
  const senderToken = useSenderStore((state) => state.token);

  // カード送信前に UUID を決めておく
  // 【なぜ先に決めるか】
  //   画像のアップロード先パスに card_id を使うため。
  //   "cards/{card_id}/image.webp" というパスでStorageに保存するので、
  //   フォーム送信より前に card_id が必要になる。
  const [cardId] = useState(() => crypto.randomUUID());

  const [formData, setFormData] = useState<CardFormData>({
    oshi_name: "",
    description: "",
    tags: [],
    external_url: "",
    image_file: null,
  });

  // アップロード済み画像の Storage パス（例: "cards/abc-123/image.webp"）
  // null = まだ画像が選ばれていない
  const [imagePath, setImagePath] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sender-Token": senderToken,
        },
        body: JSON.stringify({
          // 事前に生成した card_id を指定（Storage のパスと一致させる）
          card_id: cardId,
          oshi_name: formData.oshi_name,
          description: formData.description,
          tags: formData.tags,
          external_url: formData.external_url,
          // アップロード済みなら Storage パスを送る、なければ null
          image_path: imagePath,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      const data = await response.json();
      router.push(`/send/waiting/${data.card_id}`);

    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 推しの画像 */}
      <div className="space-y-2">
        <Label>推しの画像（任意）</Label>
        <ImageUploader
          cardId={cardId}
          onUpload={(path) => setImagePath(path)}
          onError={(msg) => setError(msg)}
        />
      </div>

      {/* 推しの名前 */}
      <div className="space-y-2">
        <Label htmlFor="oshi_name">推しの名前 *</Label>
        <Input
          id="oshi_name"
          value={formData.oshi_name}
          onChange={(e) => setFormData({ ...formData, oshi_name: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="推しの魅力を書いてください..."
          rows={4}
          maxLength={500}
        />
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
          onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "推しを送る 🍶"}
      </Button>
    </form>
  );
}
