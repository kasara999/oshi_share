// Supabase クライアントが必要とする DB の型定義
// supabase-js の新しいバージョンでは Relationships / Views / Enums なども必要

export type Database = {
  public: {
    Tables: {
      cards: {
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
        Insert: {
          id?: string;
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
        // supabase-js v2 が必要とするフィールド（外部キー関係の定義）
        Relationships: [];
      };
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
        Relationships: [];
      };
    };
    // ビュー（今回は使わないが supabase-js が要求するので空で定義）
    Views: Record<string, never>;
    Functions: {
      claim_random_card: {
        Args: { p_recipient_token: string };
        Returns: Array<{ match_id: string; card_id: string }>;
      };
    };
    // ENUM 型（今回は使わない）
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
