// アプリ全体で共通して使う TypeScript の型定義
// 送る側・受け取る側の両方がこのファイルを import して使う

// ── カード（推しの情報） ──────────────────────────────────
export type Card = {
  id: string;
  sender_token: string;      // 送った人の匿名ID（localStorage に保存されている UUID）
  oshi_name: string;         // 推しの名前
  description: string | null; // 説明（任意）
  image_path: string | null;  // Supabase Storage 内の画像パス（任意）
  external_url: string | null; // 関連URL（任意）
  tags: string[];            // ユーザーが自由に決めたタグの配列
  status: CardStatus;        // カードの状態
  created_at: string;
  expires_at: string;
};

// カードの状態を3種類に限定する（文字列なら何でも入れられないようにする）
export type CardStatus = "waiting" | "matched" | "expired";

// ── マッチング結果 ────────────────────────────────────────
export type Match = {
  id: string;
  card_id: string;           // どのカードとマッチしたか
  recipient_token: string;   // 受け取った人の匿名ID
  liked: boolean;            // いいねしたかどうか
  matched_at: string;
};

// ── カード作成フォームの入力値 ────────────────────────────
// フォームで扱うデータ（DB のカラムとは微妙に違う）
export type CardFormData = {
  oshi_name: string;
  description: string;
  tags: string[];
  external_url: string;
  image_file: File | null;   // ブラウザで選んだ画像ファイル（DB には保存しない）
};

// ── テンプレート ──────────────────────────────────────────
// localStorage に保存する推しプロフィールのテンプレート
export type OshiTemplate = {
  id: string;
  name: string;              // テンプレートの名前（例：「グラブルキャラ用」）
  oshi_name: string;
  description: string;
  tags: string[];
  external_url: string;
  created_at: string;
  // ※ 画像は localStorage に保存できないため含まない
};

// ── API レスポンスの型 ────────────────────────────────────
// /api/cards のレスポンス
export type CreateCardResponse = {
  card_id: string;
};

// /api/cards/upload-url のレスポンス
export type UploadUrlResponse = {
  upload_url: string;  // Supabase Storage の署名付きアップロード URL
  image_path: string;  // DB に保存するパス
};

// /api/match のレスポンス
export type MatchResponse = {
  match_id: string;
  card_id: string;
} | {
  // プールにカードが1枚もない場合
  match_id: null;
  card_id: null;
};
