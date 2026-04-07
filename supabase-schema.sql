-- Ejecutar esto en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  frequency_days INTEGER NOT NULL DEFAULT 14,
  last_sent_at TIMESTAMPTZ,
  alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on clients"
  ON clients FOR ALL
  USING (true)
  WITH CHECK (true);
