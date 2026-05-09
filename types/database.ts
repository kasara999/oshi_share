// Supabase が生成する DB の型定義
// 本来は `supabase gen types typescript` コマンドで自動生成するが、
// Supabase プロジェクトを作成後に実行する。
// ここでは手動で定義しておき、プロジェクト作成後に差し替える。

export type Database = {
  public: {
    Tables: {
      // cards テーブル
      cards: {
        // DB から取得したときの型（SELECT の結果）
        Row: {
          id: string;
          sender_token: string;
          oshi_name: string;
          description: string | null;
          image_path: string | null;
          external_url: string | null;
          tags: string[];
          status: string;
          created_at: string;
          expires_at: string;
        };
        // INSERT するときに渡せる型
        Insert: {
          id?: string;           // ? は省略可能（省略するとDBがデフォルト値を使う）
          sender_token: string;
          oshi_name: string;
          description?: string | null;
          image_path?: string | null;
          external_url?: string | null;
          tags?: string[];
          status?: string;
          created_at?: string;
          expires_at?: string;
        };
        // UPDATE するときに渡せる型（全フィールドが省略可能）
        Update: {
          id?: string;
          sender_token?: string;
          oshi_name?: string;
          description?: string | null;
          image_path?: string | null;
          external_url?: string | null;
          tags?: string[];
          status?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
      // matches テーブル
      matches: {
        Row: {
          id: string;
          card_id: string;
          recipient_token: string;
          liked: boolean;
          matched_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          recipient_token: string;
          liked?: boolean;
          matched_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          recipient_token?: string;
          liked?: boolean;
          matched_at?: string;
        };
      };
    };
    // DB の関数（ストアドプロシージャ）の型
    Functions: {
      // claim_random_card 関数（マッチング処理）
      claim_random_card: {
        Args: { p_recipient_token: string };
        Returns: Array<{ match_id: string; card_id: string }>;
      };
    };
  };
};
