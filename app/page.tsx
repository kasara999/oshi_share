import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">

      {/* ロゴ・キャッチコピー */}
      <div className="text-center mb-14">
        <p className="text-5xl mb-6">🍶</p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-3">
          推しシェア
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          あなたの推しを、ランダムな誰かへ。
        </p>
      </div>

      {/* ボタン */}
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <Link
          href="/send"
          className="flex items-center justify-center gap-2 h-12 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          推しを送る
        </Link>
        <Link
          href="/receive"
          className="flex items-center justify-center gap-2 h-12 rounded-xl border border-zinc-200 text-zinc-900 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          推しを受け取る
        </Link>
      </div>

      {/* フッター */}
      <p className="absolute bottom-8 text-xs text-zinc-300">
        ログイン不要・匿名で送れます
      </p>

    </main>
  );
}
