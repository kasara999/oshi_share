# 推しシェア

**[English version here](README.md)**

あなたの推しを、届けよう。

匿名でお互いの推しを送り合い、ランダムにマッチングするWebアプリです。

🔗 **https://oshi-share.vercel.app**

---

## 制作動機

見知らぬ人とお互いに好きな音楽を交換するWebサービスを見て、「同じように推しを紹介し合えたら面白いんじゃないか」と思ったのが始まりです。音楽と同じように、推しには「この人のことを誰かに知ってほしい」という気持ちが伴うことが多い。それを匿名で、ランダムな誰かと交換し合える場を作りたいと考えました。

---

## コンセプト

- ログイン不要・完全匿名
- 推しのカードを送ると、同じタイミングで誰かとマッチング
- お互いの推しを同時に見られる
- 気に入ったらいいねができる

---

## 機能

- 推しカード作成（画像・名前・説明・タグ・URL）
- ランダム双方向マッチング
- リアルタイムマッチング通知（Supabase Realtime）
- いいね機能
- マッチ履歴
- タグでみんなの推しを検索

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンド・API | Next.js 15 (App Router, TypeScript) |
| UI | Tailwind CSS / shadcn/ui |
| データベース | Supabase (PostgreSQL) |
| ストレージ | Supabase Storage |
| リアルタイム通信 | Supabase Realtime |
| 状態管理 | Zustand + localStorage |
| デプロイ | Vercel |

---

## 設計のポイント

**レースコンディション対策**

同時に複数人がマッチングリクエストを送っても同じカードが2人にマッチしないよう、PostgreSQL の `FOR UPDATE SKIP LOCKED` を使ったストアドファンクションで原子的に処理しています。

**匿名認証**

初回アクセス時に UUID を生成して localStorage に保存し、APIリクエスト時に `X-Sender-Token` ヘッダーで送信します。ログイン不要でユーザーを識別できます。

**画像アップロード**

Next.js サーバーを経由せず、署名付きURL（Signed URL）を使ってブラウザから Supabase Storage へ直接アップロードします。アップロード前にブラウザ側で WebP 変換・5MB 制限チェックを行います。

**リアルタイム通知**

待機画面では Supabase Realtime で `matches` テーブルを購読し、マッチが成立した瞬間にマッチ画面へ自動遷移します。

---

## ローカルでの起動方法

**必要なもの**
- Node.js 18以上
- Supabase プロジェクト

**手順**

```bash
git clone https://github.com/kasara999/oshi_share.git
cd oshi_share
npm install
cp .env.local.example .env.local
# .env.local に Supabase の URL・APIキーを入力
npm run dev
```

Supabase のセットアップは `supabase/schema.sql` と `supabase/rls.sql` を SQL Editor で実行してください。
