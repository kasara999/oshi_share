-- ================================================================
-- pg_cron ジョブ設定（期限切れカードの自動クリーンアップ）
-- ================================================================
--
-- ★ 実行前に必ず pg_cron を有効化すること ★
--   Supabase ダッシュボード → Database → Extensions →
--   「pg_cron」を検索 → Enable をクリック → 有効化後にこのSQLを実行
--
-- 毎日夜3時（UTC）= 日本時間 12:00 に
-- 7日以上待機中のカードを 'expired' に更新する

SELECT cron.schedule(
  'expire-old-cards',    -- ジョブの名前（重複不可）
  '0 3 * * *',           -- cron 式: 毎日 03:00 UTC
  $$
    UPDATE cards
    SET status = 'expired'
    WHERE status = 'waiting'
      AND expires_at < now();
  $$
);
