export type UserRole = "user" | "admin";
export type ListingStatus = "pending" | "active" | "rejected" | "expired" | "sold";
export type ListingCategory =
  | "chirie"
  | "joburi"
  | "masini"
  | "servicii"
  | "vand-cumpar"
  | "evenimente"
  | "matrimoniale"
  | "diverse";
export type PriceUnit = "ora" | "zi" | "saptamana" | "luna" | "an" | "total";
export type PriceType = "fix" | "negociabil" | "la_cerere" | "gratuit";
export type PromotionPlan = "free" | "basic" | "pro" | "top";
export type ContactMethod = "whatsapp" | "phone" | "message";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  role: UserRole;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  rating_avg: number;
  rating_count: number;
  response_rate: number;
  credits: number;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  category: ListingCategory;
  subcategory: string | null;
  price: number | null;
  price_unit: PriceUnit | null;
  price_type: PriceType;
  bills_included: boolean | null;
  location: string;
  postcode: string | null;
  show_exact_location: boolean;
  images: string[];
  contact_methods: ContactMethod[];
  whatsapp: string | null;
  phone: string | null;
  status: ListingStatus;
  is_promoted: boolean;
  promotion_plan: PromotionPlan;
  promotion_expires_at: string | null;
  views: number;
  saves: number;
  listing_id: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "message" | "listing_approved" | "listing_rejected" | "new_review" | "promotion_expired";
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_buyer: number;
  unread_seller: number;
  created_at: string;
  listings?: Listing;
  profiles?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  listing_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: Profile;
}