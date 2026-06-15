export type Database = {
  public: {
    Tables: {
      profiles: { Row: any; Insert: any; Update: any };
      listings: { Row: any; Insert: any; Update: any };
      saved_listings: { Row: any; Insert: any; Update: any };
      conversations: { Row: any; Insert: any; Update: any };
      messages: { Row: any; Insert: any; Update: any };
      notifications: { Row: any; Insert: any; Update: any };
      reviews: { Row: any; Insert: any; Update: any };
      payments: { Row: any; Insert: any; Update: any };
      reports: { Row: any; Insert: any; Update: any };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};