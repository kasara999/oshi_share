// 推しプロフィールのテンプレートを管理する Zustand ストア
//
// 【テンプレート機能とは】
//   同じ推しを何度も別の人に送るとき、毎回入力し直さなくて済むように
//   フォームの内容（名前・説明・タグ・URL）を保存しておける機能。
//   ※ 画像は容量が大きすぎて localStorage に保存できないので除外。

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OshiTemplate } from "@/types";

type TemplateStore = {
  templates: OshiTemplate[];

  // テンプレートを保存する
  saveTemplate: (template: Omit<OshiTemplate, "id" | "created_at">) => void;

  // テンプレートを削除する
  deleteTemplate: (id: string) => void;
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    // set: ストアの状態を更新する関数（Zustand が渡してくれる）
    // get: ストアの現在の状態を読む関数
    (set, get) => ({
      templates: [],

      saveTemplate: (template) => {
        const newTemplate: OshiTemplate = {
          ...template,
          id: crypto.randomUUID(),           // テンプレートにも一意なIDを振る
          created_at: new Date().toISOString(),
        };
        set({
          // 既存のテンプレート配列に新しいものを追加する
          // スプレッド構文 [...get().templates] で配列をコピーしてから追加
          templates: [...get().templates, newTemplate],
        });
      },

      deleteTemplate: (id) => {
        set({
          // filter で削除対象のIDだけ除いた新しい配列を作る
          templates: get().templates.filter((t) => t.id !== id),
        });
      },
    }),
    {
      name: "oshi_templates",
    }
  )
);
