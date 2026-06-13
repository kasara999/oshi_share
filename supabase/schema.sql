-- ================================================================
-- Oshi Share データベーススキーマ
-- ================================================================
-- 【使い方】
--   Supabase のダッシュボード → SQL Editor にこのファイルの内容を貼り付けて実行する
--   順番通りに実行すること（上から依存関係がある）


-- ================================================================
-- 1. cards テーブル（推しカードの情報）
-- ================================================================

CREATE TABLE cards (
  -- UUID: 推測不可能な一意のID。gen_random_uuid() がDBで自動生成する
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 送った人の匿名ID（ブラウザの localStorage から送られてくる UUID）
  sender_token  TEXT        NOT NULL,

  -- 推しの名前（必須）
  oshi_name     TEXT        NOT NULL,

  -- 説明文（任意なので NULL を許可）
  description   TEXT,

  -- Supabase Storage 内の画像パス（例: "cards/abc123/image.webp"）
  image_path    TEXT,

  -- 関連URL（任意）
  external_url  TEXT,

  -- タグの配列。PostgreSQL はネイティブで配列型をサポートしている
  -- 例: ARRAY['女性', 'ゲーム', 'グラブル']
  tags          TEXT[]      NOT NULL DEFAULT '{}',

  -- カードの状態
  -- waiting  : 誰かが受け取るのを待っている
  -- matched  : 誰かに受け取られた
  -- expired  : 7日間誰にも受け取られなかった
  status        TEXT        NOT NULL DEFAULT 'waiting'
                            CHECK (status IN ('waiting', 'matched', 'expired')),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 7日後に期限切れ（now() + INTERVAL '7 days' でDBが自動計算）
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days'
);

-- インデックス: status='waiting' のカードを高速に検索するため
-- WHERE status = 'waiting' の絞り込みが頻繁に発生するのでインデックスが効く
CREATE INDEX idx_cards_status_created ON cards (status, created_at)
  WHERE status = 'waiting';

-- インデックス: 送った人が自分のカードを確認するとき用
CREATE INDEX idx_cards_sender_token ON cards (sender_token);


-- ================================================================
-- 2. matches テーブル（マッチング結果・いいね情報）
-- ================================================================

CREATE TABLE matches (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- マッチした2枚のカード（cards.id を参照する外部キー）
  -- ON DELETE CASCADE: カードが削除されたらマッチング情報も自動で消える
  card_id_1        UUID        NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  card_id_2        UUID        NOT NULL REFERENCES cards(id) ON DELETE CASCADE,

  -- それぞれのカード送信者がいいねしたかどうか
  liked_1          BOOLEAN     NOT NULL DEFAULT false,
  liked_2          BOOLEAN     NOT NULL DEFAULT false,

  matched_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_card_id_1 ON matches (card_id_1);
CREATE INDEX idx_matches_card_id_2 ON matches (card_id_2);


-- ================================================================
-- 3. Row Level Security (RLS)
-- ================================================================
--
-- 【RLS とは】
--   「誰が・どのデータに・何ができるか」をDB側で制御する仕組み。
--   有効化するだけで anon キーからのアクセスを全ブロックできる。
--   ポリシーを追加した操作だけ許可される。

-- cards: RLS有効化（anon は一切アクセス不可 = ポリシーなし）
-- すべての操作は server.ts の service_role キー経由で行う
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- matches: RLS有効化
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- matches だけ anon の SELECT を許可（Realtime 購読に必要）
CREATE POLICY "anon_can_read_matches" ON matches
  FOR SELECT TO anon USING (true);

-- Storage: 画像のアップロード・表示を anon に許可
CREATE POLICY "anon_can_upload_images"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'card-images');

CREATE POLICY "public_can_read_images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'card-images');


-- ================================================================
-- 4. claim_random_card 関数（原子的マッチング処理）
-- ================================================================
--
-- 【なぜ関数にするか】
--   「空きカードを1枚取得して matched に更新する」処理は、
--   2人が同時に実行すると同じカードが2回マッチしてしまう（レースコンディション）。
--   PostgreSQL の FOR UPDATE SKIP LOCKED を使うと、
--   複数のリクエストが同時に来ても1枚のカードを1人にだけ渡せる。
--
-- 【SECURITY DEFINER とは】
--   この関数を実行すると、呼び出し元ではなく「関数の作成者」の権限で動く。
--   RLS（アクセス制限）をバイパスして安全に操作できる。

CREATE OR REPLACE FUNCTION claim_random_card(p_recipient_token TEXT)
RETURNS TABLE (match_id UUID, card_id UUID) AS $$
DECLARE
  v_card_id  UUID;
  v_match_id UUID;
BEGIN
  -- 待機中のカードを1枚ランダムに取得してロックする
  -- FOR UPDATE       : この行を更新するためにロックする
  -- SKIP LOCKED      : 別のトランザクションが既にロックしている行はスキップ
  --                    → 同時アクセスでも安全に異なるカードを取得できる
  SELECT id INTO v_card_id
  FROM cards
  WHERE sender_token != p_recipient_token
  ORDER BY                          -- ランダムに1枚選ぶ
    CASE status
      WHEN 'waiting' THEN 1
      WHEN 'matched' THEN 2
      WHEN 'expired' THEN 3
      ELSE 4 
    END ASC,
    random()  -- 同じ状態のカードが複数ある場合はランダムに選ぶ
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- カードが1枚も見つからなかった場合（プールが空）
  IF v_card_id IS NULL THEN
    RETURN;  -- 空のテーブルを返す（呼び出し元でNULLチェックする）
  END IF;

  -- カードの状態を 'waiting' → 'matched' に更新
  UPDATE cards SET status = 'matched' WHERE id = v_card_id;

  -- マッチング結果を matches テーブルに記録
  INSERT INTO matches (card_id, recipient_token)
  VALUES (v_card_id, p_recipient_token)
  RETURNING id INTO v_match_id;

  -- 結果を返す（match_id と card_id の両方を返す）
  RETURN QUERY SELECT v_match_id, v_card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ================================================================
-- 5. match_with_card 関数（カード送信時の即時マッチング）
-- ================================================================
--
-- カードを送信した直後に、既に待機中のカードがあればその場でマッチさせる。
-- claim_random_card と同様に FOR UPDATE SKIP LOCKED で競合を防ぐ。

CREATE OR REPLACE FUNCTION match_with_card(p_new_card_id UUID, p_sender_token TEXT)
RETURNS UUID AS $$
DECLARE
  v_waiting_card_id UUID;
  v_match_id UUID;
BEGIN
  SELECT id INTO v_waiting_card_id
  FROM cards
  WHERE status = 'waiting'
    AND expires_at > now()
    AND sender_token != p_sender_token
    AND id != p_new_card_id
  ORDER BY random()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_waiting_card_id IS NULL THEN RETURN NULL; END IF;

  UPDATE cards SET status = 'matched' WHERE id IN (v_waiting_card_id, p_new_card_id);

  INSERT INTO matches (card_id_1, card_id_2)
  VALUES (v_waiting_card_id, p_new_card_id)
  RETURNING id INTO v_match_id;

  RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ================================================================
-- 4. pg_cron による期限切れカードの自動クリーンアップ
-- ================================================================
--
-- ★ このセクションは supabase/cron.sql に分離した ★
-- pg_cron を Extensions で有効化してから cron.sql を実行すること


-- ================================================================
-- 5. Supabase Realtime の有効化
-- ================================================================
--
-- matches テーブルの変更をリアルタイムで購読できるようにする
-- （送った人の待機画面でいいね通知を受け取るために必要）
--
-- ★ Supabase ダッシュボード → Database → Replication で
--    matches テーブルを有効にすることでも設定できる ★

ALTER PUBLICATION supabase_realtime ADD TABLE matches;


-- ================================================================
-- 6. Storage バケットの作成
-- ================================================================
--
-- 推しの画像をアップロードするための Storage バケット。
-- ★ Supabase ダッシュボード → Storage → New bucket で作成してもOK ★

INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true);
-- public: true → 画像の URL を知っていれば誰でも閲覧可能
--         （推しカードの画像は受け取った人が見られる必要があるため）
