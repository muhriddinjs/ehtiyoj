-- ============================================
-- EXTIYOJ PWA — Supabase Database Schema
-- Supabase SQL Editor ga ko'chiring va ishga tushiring
-- ============================================

-- Foydalanuvchilar (Telegram ID bilan)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  username TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  sticker TEXT DEFAULT '🌙',
  language TEXT DEFAULT 'uz',
  dark_mode BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Bot OTP kodlari (5 daqiqa)
CREATE TABLE IF NOT EXISTS bot_codes (
  code TEXT PRIMARY KEY,
  telegram_chat_id BIGINT,
  user_data JSONB,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasbex yozuvlari (kunlik)
CREATE TABLE IF NOT EXISTS tasbex_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, date)
);

-- Namoz eslatma sozlamalari
CREATE TABLE IF NOT EXISTS prayer_notifications (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bomdod BOOLEAN DEFAULT TRUE,
  quyosh BOOLEAN DEFAULT FALSE,
  peshin BOOLEAN DEFAULT TRUE,
  asr BOOLEAN DEFAULT TRUE,
  shom BOOLEAN DEFAULT TRUE,
  xufton BOOLEAN DEFAULT TRUE
);

-- Foydalanuvchi fikrlari
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_tasbex_user_date ON tasbex_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_bot_codes_expires ON bot_codes(expires_at);

-- Top leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id,
  u.first_name,
  u.username,
  u.sticker,
  COALESCE(SUM(t.count), 0) as total_count,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(t.count), 0) DESC) as rank
FROM users u
LEFT JOIN tasbex_records t ON u.id = t.user_id
GROUP BY u.id, u.first_name, u.username, u.sticker
ORDER BY total_count DESC
LIMIT 100;

-- RLS yoqish
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasbex_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Service Role uchun barcha huquqlar (API routes service_role_key ishlatadi)
CREATE POLICY "service_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tasbex" ON tasbex_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_codes" ON bot_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_feedback" ON feedback FOR ALL USING (true) WITH CHECK (true);
