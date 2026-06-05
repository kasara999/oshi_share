// Supabase クライアントが必要とする DB の型定義

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
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          card_id_1: string;
          card_id_2: string;
          liked_1: boolean;
          liked_2: boolean;
          matched_at: string;
        };
        Insert: {
          id?: string;
          card_id_1: string;
          card_id_2: string;
          liked_1?: boolean;
          liked_2?: boolean;
          matched_at?: string;
        };
        Update: {
          id?: string;
          card_id_1?: string;
          card_id_2?: string;
          liked_1?: boolean;
          liked_2?: boolean;
          matched_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_with_card: {
        Args: { p_new_card_id: string; p_sender_token: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
