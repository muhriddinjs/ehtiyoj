import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side (service role) instance — faqat API routes da ishlatiladi
export const supabaseAdmin = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string;
  sticker: string;
  language: string;
  dark_mode: boolean;
  created_at: string;
  last_seen: string;
};

export type TasbexRecord = {
  id: string;
  user_id: number;
  count: number;
  date: string;
};

export type LeaderboardEntry = {
  id: number;
  first_name: string;
  username: string;
  sticker: string;
  total_count: number;
  rank: number;
};
