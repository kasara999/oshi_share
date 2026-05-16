import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background gap-8">
      <div className="text-center space-y-2">
        <div className="text-6xl">🍶</div>
        <h1 className="text-3xl font-bold">推しシェア</h1>
        <p className="text-muted-foreground">あなたの推しをランダムな誰かに届けよう</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/send"
          className="flex items-center justify-center h-14 rounded-full bg-foreground text-background font-medium text-lg hover:opacity-80 transition-opacity"
        >
          推しを送る 📨
        </Link>
        <Link
          href="/receive"
          className="flex items-center justify-center h-14 rounded-full border-2 border-foreground font-medium text-lg hover:bg-muted transition-colors"
        >
          推しを受け取る 🎁
        </Link>
      </div>
    </main>
  );
}
