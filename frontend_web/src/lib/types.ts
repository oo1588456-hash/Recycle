export type UserRole = "buyer" | "seller" | "superadmin";

export type SellerAccountStatus = "na" | "pending" | "approved" | "rejected";

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  phone_number?: string | null;
  role: UserRole;
  is_blocked?: boolean;
  seller_account_status?: SellerAccountStatus;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  is_active?: boolean;
  description?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
}

export interface SellerMini {
  id: number;
  username: string;
  email?: string;
  full_name?: string | null;
}

export interface Product {
  id: number;
  seller: SellerMini;
  category: Category | null;
  title: string;
  description: string;
  brand: string | null;
  model_name: string | null;
  storage?: string | null;
  ram?: string | null;
  processor?: string | null;
  battery_health?: string | null;
  screen_condition?: string | null;
  body_condition?: string | null;
  warranty_status?: string | null;
  accessories_included?: string | null;
  box_available?: boolean;
  original_price: string;
  final_price: string | null;
  currency: string;
  product_age_months: number | null;
  usage_duration_months: number | null;
  user_declared_condition: string | null;
  ai_condition_label?: string | null;
  ai_condition_score?: number | null;
  ai_suggested_price_min?: string | null;
  ai_suggested_price_avg?: string | null;
  ai_suggested_price_max?: string | null;
  ai_price_explanation?: string | null;
  ai_confidence_score?: number | null;
  ai_warnings?: string[] | null;
  is_ai_evaluated?: boolean;
  status: string;
  stock_quantity: number;
  location: string | null;
  views_count?: number;
  images: ProductImage[];
  created_at?: string;
}

export interface CartItem {
  id: number;
  product: number;
  quantity: number;
  product_detail?: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export interface Order {
  id: number;
  order_number: string;
  total_amount: string;
  currency: string;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: string;
  buyer_phone: string;
  notes?: string;
  created_at?: string;
  items?: { id: number; product: number; price: string; quantity: number }[];
  buyer?: number;
  seller?: number;
}
