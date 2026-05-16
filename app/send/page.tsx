// /send ページ
// 推しカードを作成するフォームを表示するページ
//
// 【Server Component とは】
//   "use client" がないファイルは Server Component として動く。
//   サーバー側でHTMLを生成してブラウザに送る（高速・SEOに強い）。
//   ただしユーザー操作（クリック・入力など）は扱えないので、
//   操作が必要な部分は "use client" の Client Component に切り出す。
//   → CardForm が "use client" になっているのはそのため。

import { CardForm } from "@/components/CardForm";

export default function SendPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12">

        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">推しを送る</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            あなたの推しをランダムな誰かに届けましょう
          </p>
        </div>

        {/* カード作成フォーム */}
        <CardForm />
      </div>
    </main>
  );
}
