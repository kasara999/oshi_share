"use client";

// 画像アップロードコンポーネント
// ドラッグ&ドロップ または クリックで画像を選択できる
//
// アップロードの流れ:
//   1. ユーザーが画像を選択
//   2. ブラウザ側で 5MB チェック・WebP に変換（容量削減）
//   3. /api/cards/upload-url から署名付き URL を取得
//   4. Supabase Storage へ直接アップロード
//   5. 親コンポーネントに image_path を通知

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

type Props = {
  cardId: string;                              // 事前に生成した UUID（パスの一部になる）
  onUpload: (imagePath: string) => void;       // アップロード完了時に親へパスを渡す
  onError: (message: string) => void;          // エラー時に親へメッセージを渡す
};

// ファイルを WebP に変換して File オブジェクトで返す関数
// 【Canvas とは】
//   ブラウザが持つ「描画領域」。画像を一度 Canvas に描いてから
//   WebP 形式で書き出すことで変換できる。
function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file); // ファイルを一時的な URL に変換

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // 長辺を 1200px に制限（それ以上は縮小）
      const MAX_SIZE = 1200;
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Canvas の内容を WebP の Blob（バイナリデータ）として取り出す
      // 0.85 = 品質85%（ファイルサイズと画質のバランス）
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url); // 一時URLを解放（メモリリーク防止）
          if (!blob) {
            reject(new Error("画像の変換に失敗しました"));
            return;
          }
          // Blob を File に変換して返す
          resolve(new File([blob], "image.webp", { type: "image/webp" }));
        },
        "image/webp",
        0.85
      );
    };

    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = url;
  });
}

export function ImageUploader({ cardId, onUpload, onError }: Props) {
  // プレビュー用の画像URL（ブラウザ内だけで使う一時URL）
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // ドラッグ中かどうか（見た目の変化に使う）
  const [isDragging, setIsDragging] = useState(false);

  // input[type=file] への参照（クリックでファイル選択ダイアログを開くために使う）
  const inputRef = useRef<HTMLInputElement>(null);

  // ファイルを受け取って処理する関数
  const handleFile = async (file: File) => {
    // 画像ファイルかチェック
    if (!file.type.startsWith("image/")) {
      onError("画像ファイルを選択してください");
      return;
    }
    // 5MB 制限
    if (file.size > 5 * 1024 * 1024) {
      onError("画像は5MB以下にしてください");
      return;
    }

    setIsUploading(true);

    try {
      // 1. WebP に変換
      const webpFile = await convertToWebP(file);

      // 2. プレビュー表示（変換後の画像で）
      const preview = URL.createObjectURL(webpFile);
      setPreviewUrl(preview);

      // 3. 署名付きアップロード URL を取得
      const res = await fetch("/api/cards/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId }),
      });

      if (!res.ok) throw new Error("アップロードURLの取得に失敗しました");
      const { upload_url, image_path } = await res.json();

      // 4. Supabase Storage へ直接アップロード（PUT リクエスト）
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: webpFile,
      });

      if (!uploadRes.ok) throw new Error("画像のアップロードに失敗しました");

      // 5. 親コンポーネントにパスを通知
      onUpload(image_path);

    } catch (e) {
      onError(e instanceof Error ? e.message : "アップロードに失敗しました");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  // ファイル選択ダイアログで選んだとき
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ドラッグ&ドロップ イベントハンドラ
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // ブラウザのデフォルト動作（ファイルを開く）を止める
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // 画像の公開URLを取得する（プレビュー以外で使う場合）
  const getPublicUrl = (path: string) =>
    supabase.storage.from("card-images").getPublicUrl(path).data.publicUrl;

  return (
    <div
      // ドラッグ中はボーダーの色を変える
      className={`relative rounded-lg border-2 border-dashed transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
        ${isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
      `}
      onClick={() => inputRef.current?.click()} // クリックでファイル選択を開く
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {previewUrl ? (
        // アップロード後：プレビュー画像を表示
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <Image
            src={previewUrl}
            alt="推しの画像"
            fill
            className="object-cover"
          />
          {/* 変更ボタン */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">画像を変更</span>
          </div>
        </div>
      ) : (
        // アップロード前：ドロップゾーン
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
          <span className="text-4xl">🖼️</span>
          <p className="text-sm font-medium">
            {isUploading ? "アップロード中..." : "画像をドロップ or クリック"}
          </p>
          <p className="text-xs">JPG・PNG・WebP対応 / 最大5MB</p>
        </div>
      )}

      {/* 非表示のファイル選択input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        // クリックイベントが div → input へ伝播しないように止める
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
