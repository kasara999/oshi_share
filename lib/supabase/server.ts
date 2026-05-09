// サーバーサイド専用の Supabase クライアント
// service_role キーを使うため RLS (アクセス制限) をバイパスできる
// ★ このファイルは絶対にブラウザに送ってはいけない ★
//   → "use client" をつけたファイルから import しない
//   → API Route と Server Component だけで使う

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// NEXT_PUBLIC_ がついていない変数はサーバーにしか存在しない（ブラウザには渡らない）
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    // サーバーサイドではセッションを自動で保存しない
    persistSession: false,
  },
});
