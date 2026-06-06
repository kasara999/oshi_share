import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">

      {/* ロゴ・キャッチコピー */}
      <div className="text-center mb-14">
        <p className="text-5xl mb-6"><Image src="/oshi_share_icon2.png" width={500} height={500} alt="ロゴ" /></p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-3">
          推し便り
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          あなたの推しを、届けよう。
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
          href="/history"
          className="flex items-center justify-center gap-2 h-12 rounded-xl border border-zinc-200 text-zinc-900 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          マッチ履歴
        </Link>
        <Link
          href="/explore"
          className="flex items-center justify-center gap-2 h-12 rounded-xl border border-zinc-200 text-zinc-900 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          みんなの推しを探す
        </Link>
      </div>

      {/* フッター */}
      <p className="absolute bottom-8 text-xs text-zinc-300">
        ログイン不要・匿名で送れます
      </p>

    </main>
  );
}
