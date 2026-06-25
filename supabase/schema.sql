-- ============================================
-- Reunión Final del Día — Database Schema
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Mexico_City',
  reminder_hour INTEGER NOT NULL DEFAULT 21,
  streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de revisiones diarias
CREATE TABLE daily_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  accomplishments TEXT NOT NULL,
  pending TEXT NOT NULL,
  learnings TEXT NOT NULL,
  blockers TEXT NOT NULL,
  tomorrow_priority TEXT NOT NULL,
  newsletter_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Índices
CREATE INDEX idx_daily_reviews_user_date ON daily_reviews(user_id, date DESC);
CREATE INDEX idx_daily_reviews_user_created ON daily_reviews(user_id, created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario solo ve/modifica sus propios datos
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own reviews"
  ON daily_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON daily_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE policy: Regla 4 — no se puede editar después de enviar
-- No DELETE policy: las reuniones son permanentes
