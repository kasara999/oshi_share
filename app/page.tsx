import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <h1 className="text-3xl font-bold mb-8">Oshi Share</h1>
      <div className="flex gap-4 justify-center">
        <Link
          href="/send"
          className="inline-block px-6 py-3 rounded-lg bg-primary text-white"
        >
          送る
        </Link>
        <Link
          href="/receive"
          className="inline-block px-6 py-3 rounded-lg border"
        >
          受け取る
        </Link>
      </div>
    </div>
  );
}
