-- Ejecutar esto en Supabase SQL Editor (https://supabase.com/dashboard)

-- Tabla de eventos
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  alert_before_minutes INTEGER NOT NULL DEFAULT 30,
  alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para búsquedas de alertas pendientes
CREATE INDEX idx_events_alert_pending
  ON events (event_date)
  WHERE alert_sent = FALSE;

-- Habilitar RLS (Row Level Security) - opcional si es single user
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo (single user, sin auth)
CREATE POLICY "Allow all operations"
  ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);
