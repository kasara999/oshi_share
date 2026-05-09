// 匿名ID（送信者トークン）を管理する Zustand ストア
//
// 【Zustand とは】
//   React のグローバルな状態管理ライブラリ。
//   「どのコンポーネントからでも同じ値にアクセスできる箱」と思えばOK。
//
// 【なぜ匿名IDが必要か】
//   ログインなしでも「あなたが送ったカード」を識別するため。
//   UUID（例: "a3f1b2c4-..."）を初回アクセス時に生成して
//   localStorage（ブラウザのローカル保存領域）に永続化する。

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SenderStore = {
  // 匿名ID（UUID文字列）
  token: string;
};

// create() でストアを定義する
// persist() でラップすると localStorage に自動保存・自動読み込みされる
export const useSenderStore = create<SenderStore>()(
  persist(
    // ストアの初期値と更新関数を定義する
    // () => {...} の形は「ストアが初めて作られたときの初期値」
    () => ({
      // crypto.randomUUID() : ブラウザ標準のUUID生成関数
      // 例: "550e8400-e29b-41d4-a716-446655440000"
      // 一度生成したら persist により localStorage に保存されるので、
      // ページをリロードしても同じ値が使われる
      token: crypto.randomUUID(),
    }),
    {
      // localStorage のキー名
      name: "oshi_sender_token",
    }
  )
);

// ── 使い方（コンポーネント内） ──────────────────────────────
// import { useSenderStore } from "@/store/senderStore";
//
// function MyComponent() {
//   const token = useSenderStore((state) => state.token);
//   // token は "a3f1b2c4-..." のような UUID 文字列
// }
