// ブラウザ（クライアントサイド）用の Supabase クライアント
// 「誰でもアクセスできる」anon キーを使う
// Row Level Security (RLS) というDB側のアクセス制限が有効なので、
// このキーが漏れても他人のデータは見れない設計になっている

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// 環境変数から接続先URLとキーを読み込む
// NEXT_PUBLIC_ がついている変数はブラウザにも公開される
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createClient: Supabase への接続を作る関数
// Database 型を渡すことで、テーブル名やカラム名の補完が効くようになる
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
