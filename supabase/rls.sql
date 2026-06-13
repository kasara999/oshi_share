-- ================================================================
-- Row Level Security (RLS) の設定
-- ================================================================
--
-- 【RLS とは】
--   データベースへのアクセス制限をDB側で管理する仕組み。
--   「誰が・どのデータに・何ができるか」をポリシーとして定義する。
--
-- 【このアプリの方針】
--   - すべての書き込み操作は Next.js の API Route 経由で行う
--     → サーバー側では service_role キーを使うので RLS をバイパスできる
--   - ブラウザ（anon キー）は直接 DB を操作しない
--     → ただし matches テーブルだけ Realtime 購読のために SELECT を許可する
--
-- ================================================================

-- ── cards テーブル ────────────────────────────────────────────
-- RLS を有効化する（有効化だけで、anon ポリシーを追加しない = anon は何もできない）
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- ── matches テーブル ──────────────────────────────────────────
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- anon（ブラウザ）が matches を読み取れるポリシーを追加する
-- 【なぜ許可するか】
--   待機画面で「いいねされたか」をリアルタイムで受け取るために
--   Supabase Realtime が matches テーブルを購読する必要があるから。
--   matches に含まれるデータは UUID とブール値（liked_1, liked_2）だけなので
--   公開しても問題ない。
--
-- FOR SELECT       : 読み取りだけ許可（書き込みは不可）
-- TO anon          : ログインしていない（anon キーを使っている）ユーザーに適用
-- USING (true)     : 全レコードを読める（フィルタはクライアント側で card_id を指定）
CREATE POLICY "anon_can_read_matches" ON matches
  FOR SELECT TO anon
  USING (true);


-- ── Storage: card-images バケット ─────────────────────────────
-- 画像のアップロードと表示に必要なポリシー

-- anon が画像をアップロードできるポリシー
-- （実際のアップロードは署名付きURLで行うが、Storage側にもポリシーが必要）
CREATE POLICY "anon_can_upload_images"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'card-images');

-- anon が画像を表示できるポリシー
-- （バケットを public にしているが、明示的にポリシーも書いておく）
CREATE POLICY "public_can_read_images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'card-images');
