// サーバーサイド専用の Supabase クライアント
// service_role キーを使うため RLS (アクセス制限) をバイパスできる
// ★ このファイルは絶対にブラウザに送ってはいけない ★
//   → "use client" をつけたファイルから import しない
//   → API Route と Server Component だけで使う

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

if (supabaseUrl && serviceRoleKey) {
  _supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
} else {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not set. server supabase client disabled.',
  );
}

export const supabaseAdmin = _supabaseAdmin as any;
